"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";

export default function SubmissionViewer() {
  const submissionText = useTriageStore((s) => s.submissionText);
  const submissionFileName = useTriageStore((s) => s.submissionFileName);

  if (!submissionText) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-ml-navy/5 px-6 py-3.5">
        <FileText className="h-4 w-4 text-ml-gold" />
        <span className="text-sm font-medium text-ml-navy">
          {submissionFileName || "Submission"}
        </span>
      </div>
      <ScrollArea className="flex-1 px-6 py-5">
        <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-ml-navy/60 font-sans">
          {submissionText}
        </pre>
      </ScrollArea>
    </div>
  );
}
