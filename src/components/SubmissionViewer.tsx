"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Highlighter } from "lucide-react";
import { useMemo, useState } from "react";
import { useTriageStore } from "@/store/triageStore";
import { ExtractedField, Confidence } from "@/lib/types";
import { FIELD_LABELS } from "@/lib/constants";

interface TextSegment {
  text: string;
  fieldName?: string;
  confidence?: Confidence;
}

const confidenceColors: Record<Confidence, { bg: string; activeBg: string }> = {
  HIGH: { bg: "bg-green-100/60", activeBg: "bg-green-200" },
  MEDIUM: { bg: "bg-amber-100/60", activeBg: "bg-amber-200" },
  LOW: { bg: "bg-red-100/60", activeBg: "bg-red-200" },
};

function buildHighlightedSegments(
  text: string,
  fields: Record<string, ExtractedField>
): TextSegment[] {
  // Build a list of matches: { start, end, fieldName, confidence }
  const matches: { start: number; end: number; fieldName: string; confidence: Confidence }[] = [];

  for (const [name, field] of Object.entries(fields)) {
    if (!field.source_text || field.source_text.length < 5) continue;
    const source = field.source_text.trim();
    const idx = text.indexOf(source);
    if (idx !== -1) {
      matches.push({ start: idx, end: idx + source.length, fieldName: name, confidence: field.confidence });
    }
  }

  if (matches.length === 0) {
    return [{ text }];
  }

  // Sort by start position, then by confidence priority for overlaps
  const priorityOrder: Record<Confidence, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  matches.sort((a, b) => a.start - b.start || priorityOrder[a.confidence] - priorityOrder[b.confidence]);

  // Remove overlapping matches (keep higher priority)
  const cleaned: typeof matches = [];
  for (const m of matches) {
    const last = cleaned[cleaned.length - 1];
    if (last && m.start < last.end) continue; // skip overlap
    cleaned.push(m);
  }

  // Build segments
  const segments: TextSegment[] = [];
  let pos = 0;
  for (const m of cleaned) {
    if (m.start > pos) {
      segments.push({ text: text.slice(pos, m.start) });
    }
    segments.push({
      text: text.slice(m.start, m.end),
      fieldName: m.fieldName,
      confidence: m.confidence,
    });
    pos = m.end;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos) });
  }

  return segments;
}

function HighlightTooltip({ fieldName, confidence }: { fieldName: string; confidence: Confidence }) {
  const label = FIELD_LABELS[fieldName] || fieldName.replace(/_/g, " ");
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-ml-navy text-white text-[11px] rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
      <span className="font-medium">{label}</span>
      <span className="text-white/50 mx-1.5">·</span>
      <span className="text-white/70">{confidence}</span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ml-navy" />
    </div>
  );
}

export default function SubmissionViewer() {
  const submissionText = useTriageStore((s) => s.submissionText);
  const submissionFileName = useTriageStore((s) => s.submissionFileName);
  const extractedFields = useTriageStore((s) => s.extractedFields);
  const activeHighlightField = useTriageStore((s) => s.activeHighlightField);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const segments = useMemo(() => {
    if (!submissionText || !showHeatmap || Object.keys(extractedFields).length === 0) {
      return null;
    }
    return buildHighlightedSegments(submissionText, extractedFields);
  }, [submissionText, extractedFields, showHeatmap]);

  if (!submissionText) return null;

  const hasFields = Object.keys(extractedFields).length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ml-navy/5 px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-ml-gold" />
          <span className="text-sm font-medium text-ml-navy">
            {submissionFileName || "Submission"}
          </span>
        </div>
        {hasFields && (
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium transition-all ${
              showHeatmap
                ? "bg-ml-gold/10 text-ml-gold-dark"
                : "text-ml-navy/30 hover:text-ml-navy/50"
            }`}
          >
            <Highlighter className="h-3 w-3" />
            Heatmap
          </button>
        )}
      </div>
      <ScrollArea className="flex-1 px-4 sm:px-6 py-5">
        {segments ? (
          <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-ml-navy/60 font-sans">
            {segments.map((seg, i) => {
              if (!seg.fieldName || !seg.confidence) {
                return <span key={i}>{seg.text}</span>;
              }

              const colors = confidenceColors[seg.confidence];
              const isActive = activeHighlightField === seg.fieldName;
              const isDimmed = activeHighlightField && !isActive;

              return (
                <span
                  key={i}
                  className={`relative inline rounded-sm px-0.5 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? colors.activeBg
                      : isDimmed
                        ? "bg-ml-navy/5 opacity-40"
                        : colors.bg
                  }`}
                  onMouseEnter={() => setHoveredField(seg.fieldName!)}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  {hoveredField === seg.fieldName && (
                    <HighlightTooltip fieldName={seg.fieldName} confidence={seg.confidence} />
                  )}
                  {seg.text}
                </span>
              );
            })}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-ml-navy/60 font-sans">
            {submissionText}
          </pre>
        )}
      </ScrollArea>
    </div>
  );
}
