"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Loader2, ArrowUpRight } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";
import { BRAND_COLOURS } from "@/lib/brand-colours";
import { BrandName } from "@/lib/types";

function ScoreRing({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" fill="none" stroke="#F0EDE8" strokeWidth="3" />
        <circle
          cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

export default function BrandRouting() {
  const brandRouting = useTriageStore((s) => s.brandRouting);
  const step = useTriageStore((s) => s.step);
  const isProcessing = useTriageStore((s) => s.isProcessing);

  if (!brandRouting && !(step === "routing" && isProcessing)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-ml-navy/30 italic font-serif">Brand routing will appear after extraction</p>
      </div>
    );
  }

  if (!brandRouting) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-ml-gold" />
        <p className="text-sm text-ml-gold-dark font-medium">Analysing brand fit...</p>
      </div>
    );
  }

  const primaryColour = BRAND_COLOURS[brandRouting.primary_brand as BrandName];
  const declineReasons = Array.isArray(brandRouting.decline_reasons) ? brandRouting.decline_reasons : [];
  const secondaryBrands = Array.isArray(brandRouting.secondary_brands) ? brandRouting.secondary_brands : [];
  const hasDecline = declineReasons.length > 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        <h3 className="font-serif text-heading-2 text-ml-navy">Brand Routing</h3>

        {/* Primary brand card */}
        <div
          className="ml-card rounded-lg bg-white p-6 animate-fade-in-up"
          style={{ opacity: 0, borderLeft: `3px solid ${primaryColour?.primary || '#C9A96E'}` }}
        >
          <div className="flex items-start gap-5">
            <ScoreRing score={brandRouting.primary_score} color={primaryColour?.primary || "#C9A96E"} />
            <div className="flex-1 min-w-0">
              <span className="inline-block rounded bg-ml-navy px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase">
                Primary Match
              </span>
              <h4 className="mt-2 font-serif text-heading-2" style={{ color: primaryColour?.primary || "#0B0B2D" }}>
                {brandRouting.primary_brand}
              </h4>
              <p className="mt-2 text-sm text-ml-navy/50 leading-relaxed">
                {brandRouting.primary_reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Secondary brands */}
        {secondaryBrands.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">
              Secondary Matches
            </p>
            {secondaryBrands.map((match, index) => {
              const colour = BRAND_COLOURS[match.brand as BrandName];
              return (
                <div
                  key={match.brand}
                  className="ml-card flex items-center gap-4 rounded-lg bg-white p-4 animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${200 + index * 100}ms` }}
                >
                  <ScoreRing score={match.score} color={colour?.primary || "#6B6B8D"} />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif text-lg font-medium" style={{ color: colour?.primary || "#0B0B2D" }}>
                      {match.brand}
                    </h5>
                    <p className="mt-1 text-xs text-ml-navy/40 leading-relaxed">{match.reasoning}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-ml-navy/15" />
                </div>
              );
            })}
          </div>
        )}

        {/* Decline reasons */}
        {hasDecline && (
          <div className="rounded-lg border border-red-100 bg-red-50/50 p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-700" />
              <h5 className="text-sm font-semibold text-red-800">Decline Factors</h5>
            </div>
            <ul className="space-y-1.5">
              {declineReasons.map((reason, i) => (
                <li key={i} className="text-sm text-red-700/80 pl-6 relative before:content-[''] before:absolute before:left-2 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-red-400">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
