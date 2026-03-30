import { NextResponse } from "next/server";
import { SAMPLE_SUBMISSIONS } from "@/lib/samples";

export async function GET() {
  const samples = SAMPLE_SUBMISSIONS.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    brandHint: s.brandHint,
    icon: s.icon,
  }));

  return NextResponse.json(samples);
}
