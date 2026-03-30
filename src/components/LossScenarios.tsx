"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, TrendingDown, Loader2 } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";
import { ScenarioSeverity, ScenarioLikelihood } from "@/lib/types";

const severityConfig: Record<ScenarioSeverity, { color: string; bg: string; label: string }> = {
  catastrophic: { color: "text-red-800", bg: "bg-red-50", label: "Catastrophic" },
  major: { color: "text-amber-800", bg: "bg-amber-50", label: "Major" },
  moderate: { color: "text-yellow-700", bg: "bg-yellow-50", label: "Moderate" },
  minor: { color: "text-green-700", bg: "bg-green-50", label: "Minor" },
};

const likelihoodConfig: Record<ScenarioLikelihood, { color: string; bg: string; label: string }> = {
  high: { color: "text-red-700", bg: "bg-red-50", label: "High" },
  medium: { color: "text-amber-700", bg: "bg-amber-50", label: "Medium" },
  low: { color: "text-blue-700", bg: "bg-blue-50", label: "Low" },
  rare: { color: "text-gray-600", bg: "bg-gray-50", label: "Rare" },
};

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function LossScenarios() {
  const lossScenarios = useTriageStore((s) => s.lossScenarios);
  const isProcessing = useTriageStore((s) => s.isProcessing);

  if (lossScenarios.length === 0 && isProcessing) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-ml-gold" />
        <p className="text-sm text-ml-gold-dark font-medium">Modelling loss scenarios...</p>
      </div>
    );
  }

  if (lossScenarios.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-ml-navy/30 italic font-serif">Loss scenarios will appear after analysis completes</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-heading-2 text-ml-navy">Loss Scenarios</h3>
          <span className="text-xs text-ml-navy/30 font-medium">{lossScenarios.length} scenarios</span>
        </div>

        {lossScenarios.map((scenario, index) => {
          const sev = severityConfig[scenario.severity] || severityConfig.moderate;
          const lik = likelihoodConfig[scenario.likelihood] || likelihoodConfig.medium;

          return (
            <div
              key={index}
              className="ml-card rounded-lg bg-white p-5 animate-fade-in-up"
              style={{ opacity: 0, animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className={`h-4 w-4 shrink-0 mt-1 ${sev.color}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-lg font-medium text-ml-navy">{scenario.title}</h4>
                  <p className="mt-1.5 text-sm text-ml-navy/50 leading-relaxed">{scenario.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${sev.bg} ${sev.color}`}>
                  {sev.label}
                </span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${lik.bg} ${lik.color}`}>
                  {lik.label} likelihood
                </span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-ml-navy/30" />
                  <span className="text-sm font-medium text-ml-navy">
                    {formatCurrency(scenario.financial_impact_low)} — {formatCurrency(scenario.financial_impact_high)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
