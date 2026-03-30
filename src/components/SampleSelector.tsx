"use client";

import { Factory, Hotel, Building2, ShieldAlert, LucideIcon } from "lucide-react";
import { SAMPLE_SUBMISSIONS } from "@/lib/samples";
import { BRAND_COLOURS } from "@/lib/brand-colours";
import { useTriageStore } from "@/store/triageStore";

const ICON_MAP: Record<string, LucideIcon> = {
  Factory,
  Hotel,
  Building2,
  ShieldAlert,
};

export default function SampleSelector() {
  const startTriageFromSample = useTriageStore((s) => s.startTriageFromSample);

  return (
    <div className="grid grid-cols-2 gap-3">
      {SAMPLE_SUBMISSIONS.map((sample, index) => {
        const Icon = ICON_MAP[sample.icon] || Factory;
        const brandColour = BRAND_COLOURS[sample.brandHint];

        return (
          <button
            key={sample.id}
            onClick={() => startTriageFromSample(sample.id)}
            className="ml-card group relative flex items-start gap-3.5 rounded-lg bg-white p-4 text-left animate-fade-in-up"
            style={{ opacity: 0, animationDelay: `${400 + index * 80}ms` }}
          >
            <div
              className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-300 group-hover:h-auto"
              style={{ backgroundColor: brandColour.primary }}
            />
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: `${brandColour.primary}10` }}
            >
              <Icon className="h-4 w-4" style={{ color: brandColour.primary }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ml-navy leading-tight">{sample.title}</p>
              <p className="text-xs text-ml-navy/40 mt-0.5">{sample.subtitle}</p>
              <p className="mt-1.5 text-[10px] font-medium tracking-wide uppercase" style={{ color: brandColour.primary }}>
                {brandColour.label}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
