"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldX, ShieldPlus, ClipboardCheck, FileWarning, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTriageStore } from "@/store/triageStore";
import { RecommendationType, RecommendationPriority, PolicyRecommendation } from "@/lib/types";

const typeConfig: Record<RecommendationType, { icon: typeof ShieldX; color: string; bg: string; label: string }> = {
  exclusion: { icon: ShieldX, color: "text-red-700", bg: "bg-red-50", label: "Exclusion" },
  endorsement: { icon: ShieldPlus, color: "text-blue-700", bg: "bg-blue-50", label: "Endorsement" },
  subjectivity: { icon: FileWarning, color: "text-amber-700", bg: "bg-amber-50", label: "Subjectivity" },
  condition: { icon: ClipboardCheck, color: "text-gray-600", bg: "bg-gray-100", label: "Condition" },
};

const priorityDot: Record<RecommendationPriority, { color: string; label: string }> = {
  essential: { color: "bg-red-600", label: "Essential" },
  recommended: { color: "bg-amber-500", label: "Recommended" },
  consider: { color: "bg-gray-400", label: "Consider" },
};

function RecommendationCard({ rec, index }: { rec: PolicyRecommendation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const type = typeConfig[rec.type] || typeConfig.condition;
  const priority = priorityDot[rec.priority] || priorityDot.consider;
  const Icon = type.icon;

  return (
    <div
      className="ml-card rounded-lg bg-white p-4 animate-fade-in-up"
      style={{ opacity: 0, animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${type.bg}`}>
          <Icon className={`h-4 w-4 ${type.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${type.bg} ${type.color}`}>
              {type.label}
            </span>
            <div className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${priority.color}`} />
              <span className="text-[10px] text-ml-navy/40">{priority.label}</span>
            </div>
          </div>
          <p className="text-sm text-ml-navy leading-relaxed">{rec.text}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] text-ml-navy/30 hover:text-ml-gold-dark transition-colors"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Reasoning
          </button>
          {expanded && (
            <p className="mt-2 rounded bg-ml-cream/80 p-2.5 text-xs italic text-ml-navy/40 border border-ml-navy/5">
              {rec.reasoning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PolicyRecommendations() {
  const policyRecommendations = useTriageStore((s) => s.policyRecommendations);
  const isProcessing = useTriageStore((s) => s.isProcessing);

  if (policyRecommendations.length === 0 && isProcessing) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-ml-gold" />
        <p className="text-sm text-ml-gold-dark font-medium">Generating policy recommendations...</p>
      </div>
    );
  }

  if (policyRecommendations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-ml-navy/30 italic font-serif">Policy recommendations will appear after analysis completes</p>
      </div>
    );
  }

  // Group by type
  const grouped = policyRecommendations.reduce((acc, rec) => {
    const t = rec.type || "condition";
    if (!acc[t]) acc[t] = [];
    acc[t].push(rec);
    return acc;
  }, {} as Record<string, PolicyRecommendation[]>);

  // Sort groups by priority within each
  const priorityOrder: Record<string, number> = { essential: 0, recommended: 1, consider: 2 };
  Object.values(grouped).forEach((recs) =>
    recs.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
  );

  const typeOrder: RecommendationType[] = ["exclusion", "endorsement", "subjectivity", "condition"];
  let globalIndex = 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-heading-2 text-ml-navy">Policy Wording</h3>
          <span className="text-xs text-ml-navy/30 font-medium">{policyRecommendations.length} recommendations</span>
        </div>

        {typeOrder.map((type) => {
          const recs = grouped[type];
          if (!recs || recs.length === 0) return null;
          const config = typeConfig[type];

          return (
            <div key={type}>
              <p className="mb-2 text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">
                {config.label}s ({recs.length})
              </p>
              <div className="space-y-2">
                {recs.map((rec) => (
                  <RecommendationCard key={globalIndex} rec={rec} index={globalIndex++} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
