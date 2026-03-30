"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";

function ArcGauge({ score, grade }: { score: number; grade: string }) {
  // 270-degree arc gauge
  const radius = 80;
  const strokeWidth = 10;
  const cx = 100;
  const cy = 100;
  const startAngle = 135; // degrees from 12 o'clock
  const endAngle = 405; // 270 degree sweep
  const sweepAngle = endAngle - startAngle;
  const filledAngle = startAngle + (score / 100) * sweepAngle;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const gradeColors: Record<string, string> = {
    excellent: "#15803D",
    good: "#65A30D",
    fair: "#CA8A04",
    poor: "#DC2626",
    insufficient: "#991B1B",
  };

  const color = gradeColors[grade] || "#CA8A04";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 175" className="w-56 h-auto">
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#F0EDE8"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {score > 0 && (
          <path
            d={describeArc(startAngle, filledAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-ml-navy" style={{ fontSize: "36px", fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}>
          {score}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-ml-navy/40" style={{ fontSize: "12px", fontFamily: "DM Sans, sans-serif" }}>
          out of 100
        </text>
      </svg>
      <span
        className="mt-1 rounded-full px-4 py-1 text-sm font-semibold capitalize tracking-wide text-white"
        style={{ backgroundColor: color }}
      >
        {grade}
      </span>
    </div>
  );
}

export default function CompletenessGauge() {
  const completenessScore = useTriageStore((s) => s.completenessScore);
  const isProcessing = useTriageStore((s) => s.isProcessing);

  if (!completenessScore && isProcessing) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-ml-gold" />
        <p className="text-sm text-ml-gold-dark font-medium">Scoring completeness...</p>
      </div>
    );
  }

  if (!completenessScore) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-ml-navy/30 italic font-serif">Completeness score will appear after analysis completes</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        <h3 className="font-serif text-heading-2 text-ml-navy">Submission Completeness</h3>

        {/* Gauge */}
        <div className="ml-card rounded-lg bg-white p-6 flex flex-col items-center animate-fade-in">
          <ArcGauge score={completenessScore.overall_score} grade={completenessScore.grade} />
          <p className="mt-4 text-sm text-ml-navy/50 text-center max-w-md leading-relaxed">
            {completenessScore.summary}
          </p>
        </div>

        {/* Category Breakdown */}
        <div>
          <p className="mb-3 text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">Category Breakdown</p>
          <div className="space-y-3">
            {(completenessScore.categories || []).map((cat, index) => (
              <div
                key={cat.category}
                className="ml-card rounded-lg bg-white p-4 animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${200 + index * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ml-navy">{cat.category}</span>
                  <span className="text-sm font-bold text-ml-navy">{cat.score}%</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-ml-navy/5 mb-3">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${cat.score}%`,
                      backgroundColor: cat.score >= 80 ? "#15803D" : cat.score >= 60 ? "#65A30D" : cat.score >= 40 ? "#CA8A04" : "#DC2626",
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(cat.fields_present || []).map((f) => (
                    <span key={f} className="flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {f.replace(/_/g, " ")}
                    </span>
                  ))}
                  {(cat.fields_missing || []).map((f) => (
                    <span key={f} className="flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700">
                      <XCircle className="h-2.5 w-2.5" />
                      {f.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
