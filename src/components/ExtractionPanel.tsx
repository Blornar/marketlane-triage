"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Loader2, Highlighter } from "lucide-react";
import { useState } from "react";
import { useTriageStore } from "@/store/triageStore";
import { FIELD_LABELS } from "@/lib/constants";
import { Confidence } from "@/lib/types";

const confidenceStyles: Record<Confidence, { bg: string; text: string; label: string }> = {
  HIGH: { bg: "bg-green-50", text: "text-green-700", label: "High" },
  MEDIUM: { bg: "bg-amber-50", text: "text-amber-700", label: "Med" },
  LOW: { bg: "bg-red-50", text: "text-red-700", label: "Low" },
};

export default function ExtractionPanel() {
  const extractedFields = useTriageStore((s) => s.extractedFields);
  const isProcessing = useTriageStore((s) => s.isProcessing);
  const step = useTriageStore((s) => s.step);
  const activeHighlightField = useTriageStore((s) => s.activeHighlightField);
  const setActiveHighlightField = useTriageStore((s) => s.setActiveHighlightField);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const fieldEntries = Object.entries(extractedFields);
  const isExtracting = step === "extracting" && isProcessing;

  const handleFieldClick = (name: string) => {
    setActiveHighlightField(activeHighlightField === name ? null : name);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-heading-2 text-ml-navy">
            Extracted Fields
          </h3>
          {isExtracting && (
            <div className="flex items-center gap-2 text-sm text-ml-gold-dark">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-medium tracking-wide uppercase">Extracting...</span>
            </div>
          )}
          {!isExtracting && fieldEntries.length > 0 && (
            <span className="text-xs text-ml-navy/30 font-medium">
              {fieldEntries.length} fields
            </span>
          )}
        </div>

        {fieldEntries.map(([name, field], index) => {
          const style = confidenceStyles[field.confidence];
          const isExpanded = expandedField === name;
          const isHighlighted = activeHighlightField === name;
          const label = FIELD_LABELS[name] || name.replace(/_/g, " ");
          const hasSource = !!field.source_text && field.source_text.length >= 5;

          return (
            <div
              key={name}
              className={`ml-card rounded-lg bg-white p-4 animate-fade-in-up transition-all duration-200 ${
                isHighlighted ? "ring-2 ring-ml-gold/40 border-ml-gold/30" : ""
              } ${hasSource ? "cursor-pointer" : ""}`}
              style={{ opacity: 0, animationDelay: `${index * 60}ms` }}
              onClick={() => hasSource && handleFieldClick(name)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">
                      {label}
                    </p>
                    {isHighlighted && (
                      <Highlighter className="h-3 w-3 text-ml-gold" />
                    )}
                  </div>
                  <p className="text-sm text-ml-navy leading-relaxed">
                    {field.value}
                  </p>
                </div>
                <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
              {field.source_text && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedField(isExpanded ? null : name); }}
                    className="mt-2.5 flex items-center gap-1 text-[11px] text-ml-navy/30 hover:text-ml-gold-dark transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Source
                  </button>
                  {isExpanded && (
                    <p className="mt-2 rounded bg-ml-cream/80 p-2.5 text-xs italic text-ml-navy/40 border border-ml-navy/5">
                      &ldquo;{field.source_text}&rdquo;
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}

        {fieldEntries.length === 0 && !isExtracting && (
          <p className="py-16 text-center text-sm text-ml-navy/30">
            No fields extracted yet
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
