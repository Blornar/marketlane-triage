import { create } from "zustand";
import {
  TriageStep,
  ExtractedField,
  BrandRouting,
  RiskAssessment,
  MissingField,
  TriageMetadata,
  TriageResult,
  ChatMessage,
  SSEEvent,
} from "@/lib/types";
import { SAMPLE_SUBMISSIONS } from "@/lib/samples";

interface TriageStore {
  // Workflow
  step: TriageStep;

  // Submission
  submissionText: string | null;
  submissionFileName: string | null;

  // Streaming results
  extractedFields: Record<string, ExtractedField>;
  brandRouting: BrandRouting | null;
  riskAssessment: RiskAssessment | null;
  missingFields: MissingField[];
  metadata: TriageMetadata | null;
  fullResult: TriageResult | null;

  // Chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // UI
  error: string | null;
  isProcessing: boolean;

  // Actions
  startTriageFromText: (text: string, fileName?: string) => Promise<void>;
  startTriageFromFile: (file: File) => Promise<void>;
  startTriageFromSample: (sampleId: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: "upload" as TriageStep,
  submissionText: null,
  submissionFileName: null,
  extractedFields: {},
  brandRouting: null,
  riskAssessment: null,
  missingFields: [],
  metadata: null,
  fullResult: null,
  chatMessages: [],
  chatLoading: false,
  error: null,
  isProcessing: false,
};

export const useTriageStore = create<TriageStore>((set, get) => ({
  ...initialState,

  startTriageFromText: async (text: string, fileName?: string) => {
    set({
      ...initialState,
      step: "extracting",
      submissionText: text,
      submissionFileName: fileName || "Pasted text",
      isProcessing: true,
    });

    await consumeSSEStream(
      fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }),
      set,
      get
    );
  },

  startTriageFromFile: async (file: File) => {
    set({
      ...initialState,
      step: "extracting",
      submissionFileName: file.name,
      isProcessing: true,
    });

    // Read file text for display in the viewer
    const reader = new FileReader();
    reader.onload = () => {
      set({ submissionText: reader.result as string });
    };
    if (file.type === "application/pdf") {
      // For PDF, we'll get the text back from the API later via the full result
      set({ submissionText: "(PDF content being processed server-side...)" });
    } else {
      reader.readAsText(file);
    }

    const formData = new FormData();
    formData.append("file", file);

    await consumeSSEStream(
      fetch("/api/triage", {
        method: "POST",
        body: formData,
      }),
      set,
      get
    );
  },

  startTriageFromSample: async (sampleId: string) => {
    const sample = SAMPLE_SUBMISSIONS.find((s) => s.id === sampleId);
    if (!sample) return;

    set({
      ...initialState,
      step: "extracting",
      submissionText: sample.content,
      submissionFileName: sample.title,
      isProcessing: true,
    });

    await consumeSSEStream(
      fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleId }),
      }),
      set,
      get
    );
  },

  sendChatMessage: async (message: string) => {
    const { submissionText, fullResult, chatMessages } = get();
    if (!submissionText || !fullResult) return;

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: message },
    ];
    set({ chatMessages: newMessages, chatLoading: true });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: chatMessages,
          submissionText,
          triageResult: fullResult,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      set({
        chatMessages: [
          ...newMessages,
          { role: "assistant", content: data.reply },
        ],
        chatLoading: false,
      });
    } catch {
      set({
        chatMessages: [
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ],
        chatLoading: false,
      });
    }
  },

  reset: () => set(initialState),
}));

async function consumeSSEStream(
  fetchPromise: Promise<Response>,
  set: (state: Partial<TriageStore>) => void,
  get: () => TriageStore
) {
  try {
    const response = await fetchPromise;

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Request failed" }));
      set({ error: err.error || "Request failed", isProcessing: false });
      return;
    }

    if (!response.body) {
      set({ error: "No response stream", isProcessing: false });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          set({ isProcessing: false });
          continue;
        }

        try {
          const event: SSEEvent = JSON.parse(data);
          handleSSEEvent(event, set, get);
        } catch {
          // Skip malformed events
        }
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection error";
    set({ error: message, isProcessing: false });
  }
}

function handleSSEEvent(
  event: SSEEvent,
  set: (state: Partial<TriageStore>) => void,
  get: () => TriageStore
) {
  switch (event.type) {
    case "step":
      set({ step: event.step });
      break;
    case "field":
      set({
        extractedFields: {
          ...get().extractedFields,
          [event.name]: event.field,
        },
      });
      break;
    case "brand_routing":
      set({ brandRouting: event.data, step: "routing" });
      break;
    case "risk_assessment":
      set({ riskAssessment: event.data, step: "assessing" });
      break;
    case "missing_fields":
      set({ missingFields: event.data });
      break;
    case "metadata":
      set({ metadata: event.data });
      break;
    case "complete":
      set({
        fullResult: event.data,
        step: "complete",
        isProcessing: false,
        // Ensure all sub-fields are populated from the complete result
        extractedFields:
          Object.keys(get().extractedFields).length > 0
            ? get().extractedFields
            : event.data.extracted_fields,
        brandRouting: get().brandRouting || event.data.brand_routing,
        riskAssessment: get().riskAssessment || event.data.risk_assessment,
        missingFields:
          get().missingFields.length > 0
            ? get().missingFields
            : event.data.missing_fields,
        metadata: event.data.metadata,
      });
      break;
    case "error":
      set({ error: event.message, isProcessing: false });
      break;
    case "ping":
      break;
  }
}
