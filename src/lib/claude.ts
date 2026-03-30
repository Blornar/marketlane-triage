import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, REFERRAL_NOTES_PROMPT } from "./system-prompt";
import { StreamingJsonParser } from "./streaming-parser";
import { SSEEvent, ChatMessage, TriageResult, ReferralNotes } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

/**
 * Stream a triage analysis of the given submission text.
 * Returns an async generator yielding SSE events as sections complete.
 */
export async function* streamTriage(
  submissionText: string,
  submissionType: "pdf" | "email" | "manual" | "sample"
): AsyncGenerator<SSEEvent> {
  const parser = new StreamingJsonParser();
  const startTime = Date.now();

  yield { type: "step", step: "extracting" };

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 12288,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyse this insurance submission and return the triage JSON.\n\nSubmission type: ${submissionType}\n\n<submission>\n${submissionText}\n</submission>`,
      },
    ],
  });

  let fieldCount = 0;
  let routingEmitted = false;
  let assessmentEmitted = false;

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const events = parser.feed(event.delta.text);

      for (const sseEvent of events) {
        if (sseEvent.type === "field") {
          fieldCount++;
          yield sseEvent;
          // Transition to routing step after a few fields
          if (fieldCount === 3) {
            yield { type: "step", step: "extracting" };
          }
        } else if (sseEvent.type === "brand_routing") {
          if (!routingEmitted) {
            yield { type: "step", step: "routing" };
            routingEmitted = true;
          }
          yield sseEvent;
        } else if (sseEvent.type === "risk_assessment") {
          if (!assessmentEmitted) {
            yield { type: "step", step: "assessing" };
            assessmentEmitted = true;
          }
          yield sseEvent;
        } else if (sseEvent.type === "loss_scenarios" || sseEvent.type === "completeness_score" || sseEvent.type === "policy_recommendations") {
          yield sseEvent;
        } else {
          yield sseEvent;
        }
      }
    }
  }

  // Attempt to build the full result as fallback
  const fullResult = parser.getFullResult();
  if (fullResult) {
    const triageResult = fullResult as unknown as TriageResult;
    // Patch metadata with actual processing time
    if (triageResult.metadata) {
      triageResult.metadata.processing_time_ms = Date.now() - startTime;
    }
    yield { type: "step", step: "complete" };
    yield { type: "complete", data: triageResult };
  }
}

/**
 * Send a follow-up chat message with full submission context.
 */
export async function chatWithContext(
  messages: ChatMessage[],
  submissionText: string,
  triageResult: TriageResult
): Promise<string> {
  const contextMessage = `<original_submission>\n${submissionText}\n</original_submission>\n\n<triage_result>\n${JSON.stringify(triageResult, null, 2)}\n</triage_result>`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `${CHAT_SYSTEM_PROMPT}\n\nContext:\n${contextMessage}`,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "I was unable to generate a response.";
}

/**
 * Generate referral notes on demand from a completed triage.
 */
export async function generateReferralNotes(
  submissionText: string,
  triageResult: TriageResult
): Promise<ReferralNotes> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: REFERRAL_NOTES_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate referral notes for this submission.\n\n<submission>\n${submissionText}\n</submission>\n\n<triage_result>\n${JSON.stringify(triageResult, null, 2)}\n</triage_result>`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No response from model");

  // Parse JSON from response, stripping any markdown fencing
  let text = textBlock.text.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(text) as ReferralNotes;
}
