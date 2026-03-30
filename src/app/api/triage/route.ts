import { NextRequest } from "next/server";
import { streamTriage } from "@/lib/claude";
import { SAMPLE_SUBMISSIONS } from "@/lib/samples";
import { MAX_FILE_SIZE_BYTES, MAX_TEXT_LENGTH } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let submissionText: string;
    let submissionType: "pdf" | "email" | "manual" | "sample";

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return new Response(
          JSON.stringify({ error: "File exceeds 10MB limit" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const { extractTextFromPDF } = await import("@/lib/pdf-extract");
        submissionText = await extractTextFromPDF(buffer);
        submissionType = "pdf";
      } else {
        submissionText = buffer.toString("utf-8");
        submissionType = file.name.endsWith(".eml") ? "email" : "manual";
      }
    } else {
      // JSON body: text paste or sample selection
      const body = await req.json();

      if (body.sampleId) {
        const sample = SAMPLE_SUBMISSIONS.find((s) => s.id === body.sampleId);
        if (!sample) {
          return new Response(
            JSON.stringify({ error: "Sample not found" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        submissionText = sample.content;
        submissionType = "sample";
      } else if (body.text) {
        if (body.text.length > MAX_TEXT_LENGTH) {
          return new Response(
            JSON.stringify({ error: "Text exceeds 50,000 character limit" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        submissionText = body.text;
        submissionType = "manual";
      } else {
        return new Response(
          JSON.stringify({ error: "No submission content provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (!submissionText.trim()) {
      return new Response(
        JSON.stringify({ error: "Submission text is empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          for await (const event of streamTriage(submissionText, submissionType)) {
            send(JSON.stringify(event));
          }
          send("[DONE]");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "An unexpected error occurred";
          send(JSON.stringify({ type: "error", message }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
