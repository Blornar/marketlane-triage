import { NextRequest, NextResponse } from "next/server";
import { generateReferralNotes } from "@/lib/claude";
import { TriageResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionText, triageResult } = body as {
      submissionText: string;
      triageResult: TriageResult;
    };

    if (!submissionText || !triageResult) {
      return NextResponse.json(
        { error: "Missing submissionText or triageResult" },
        { status: 400 }
      );
    }

    const referralNotes = await generateReferralNotes(submissionText, triageResult);
    return NextResponse.json({ referralNotes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate referral notes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
