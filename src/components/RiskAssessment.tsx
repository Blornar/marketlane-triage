"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertOctagon, AlertTriangle, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";
import { Severity } from "@/lib/types";

const severityConfig: Record<Severity, { icon: typeof AlertOctagon; color: string; bg: string; border: string; label: string }> = {
  RED: { icon: AlertOctagon, color: "text-red-700", bg: "bg-red-50/80", border: "border-l-red-600", label: "Critical" },
  AMBER: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50/80", border: "border-l-amber-500", label: "Review" },
  GREEN: { icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50/80", border: "border-l-green-600", label: "Positive" },
};

export default function RiskAssessment() {
  const riskAssessment = useTriageStore((s) => s.riskAssessment);
  const step = useTriageStore((s) => s.step);
  const isProcessing = useTriageStore((s) => s.isProcessing);

  if (!riskAssessment && !(step === "assessing" && isProcessing)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-ml-navy/30 italic font-serif">Risk assessment will appear after routing</p>
      </div>
    );
  }

  if (!riskAssessment) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-ml-gold" />
        <p className="text-sm text-ml-gold-dark font-medium">Assessing risk...</p>
      </div>
    );
  }

  const riskFlags = Array.isArray(riskAssessment.risk_flags) ? riskAssessment.risk_flags : [];
  const followUpQuestions = Array.isArray(riskAssessment.follow_up_questions) ? riskAssessment.follow_up_questions : [];
  const sortedFlags = [...riskFlags].sort((a, b) => {
    const order: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Summary Narrative */}
        <div>
          <h3 className="font-serif text-heading-2 text-ml-navy mb-4">Risk Assessment</h3>
          <div className="ml-card rounded-lg bg-white p-5 animate-fade-in">
            {(riskAssessment.summary_narrative || "").split("\n").map((para, i) => (
              <p key={i} className="text-sm text-ml-navy/60 leading-relaxed [&:not(:first-child)]:mt-3">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Risk Flags */}
        {sortedFlags.length > 0 && (
          <div>
            <p className="mb-3 text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">Risk Flags</p>
            <div className="space-y-2">
              {sortedFlags.map((flag, index) => {
                const config = severityConfig[flag.severity] || severityConfig.AMBER;
                const Icon = config.icon;
                return (
                  <div
                    key={`${flag.severity}-${index}`}
                    className={`rounded-lg border-l-3 ${config.border} ${config.bg} p-4 animate-fade-in-up`}
                    style={{ opacity: 0, animationDelay: `${index * 80}ms`, borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${config.color}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${config.color}`}>{config.label}</span>
                          <span className="text-[10px] text-ml-navy/30">·</span>
                          <span className="text-[10px] text-ml-navy/40">{flag.category}</span>
                        </div>
                        <p className="text-sm text-ml-navy/70">{flag.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {followUpQuestions.length > 0 && (
          <div>
            <p className="mb-3 text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">
              Recommended Follow-Up Questions
            </p>
            <div className="space-y-2">
              {followUpQuestions.map((question, index) => (
                <div
                  key={index}
                  className="ml-card flex items-start gap-3 rounded-lg bg-white p-4 animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${300 + index * 80}ms` }}
                >
                  <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-ml-gold" />
                  <p className="text-sm text-ml-navy/70">{question}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
