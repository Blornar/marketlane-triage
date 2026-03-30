"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTriageStore } from "@/store/triageStore";
import { Importance } from "@/lib/types";

const importanceStyles: Record<Importance, { bg: string; text: string; label: string }> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", label: "Critical" },
  IMPORTANT: { bg: "bg-amber-50", text: "text-amber-700", label: "Important" },
  OPTIONAL: { bg: "bg-gray-50", text: "text-gray-500", label: "Optional" },
};

export default function MissingFields() {
  const missingFields = useTriageStore((s) => s.missingFields);
  const [copied, setCopied] = useState(false);

  if (!missingFields || missingFields.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-ml-navy/30 italic font-serif">No missing fields identified</p>
      </div>
    );
  }

  const copyAllQuestions = async () => {
    const questions = missingFields
      .filter((f) => f && f.suggested_question)
      .map((f, i) => `${i + 1}. ${f.suggested_question}`)
      .join("\n");
    await navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sorted = [...missingFields]
    .filter((f) => f && typeof f === "object")
    .sort((a, b) => {
      const order: Record<string, number> = { CRITICAL: 0, IMPORTANT: 1, OPTIONAL: 2 };
      return (order[a.importance] ?? 2) - (order[b.importance] ?? 2);
    });

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="font-serif text-heading-2 text-ml-navy">Missing Information</h3>
            <span className="rounded bg-ml-navy/5 px-2 py-0.5 text-[10px] font-semibold text-ml-navy/40">
              {sorted.length}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllQuestions}
            className="border-ml-navy/10 text-xs text-ml-navy/50 hover:text-ml-navy hover:border-ml-gold/30"
          >
            {copied ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? "Copied" : "Copy All"}
          </Button>
        </div>

        <div className="space-y-2">
          {sorted.map((field, index) => {
            const fieldName = field.field_name || "Unknown field";
            const importance = field.importance || "OPTIONAL";
            const style = importanceStyles[importance as Importance] || importanceStyles.OPTIONAL;
            const question = field.suggested_question || "";

            return (
              <div
                key={fieldName + index}
                className="ml-card rounded-lg bg-white p-4 animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-ml-navy capitalize">
                    {fieldName.replace(/_/g, " ")}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                {question && (
                  <p className="text-sm text-ml-gold-dark italic leading-relaxed">
                    &ldquo;{question}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
