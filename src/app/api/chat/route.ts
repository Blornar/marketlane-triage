import { NextRequest, NextResponse } from "next/server";
import { chatWithContext } from "@/lib/claude";
import { ChatMessage, TriageResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
  message: string;
  history: ChatMessage[];
  submissionText: string;
  triageResult: TriageResult;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();

    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      ...body.history,
      { role: "user", content: body.message },
    ];

    const reply = await chatWithContext(
      messages,
      body.submissionText,
      body.triageResult
    );

    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
