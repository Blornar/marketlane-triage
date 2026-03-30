"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Copy, Check, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useTriageStore } from "@/store/triageStore";

export default function ReferralNotes() {
  const referralNotes = useTriageStore((s) => s.referralNotes);
  const referralNotesLoading = useTriageStore((s) => s.referralNotesLoading);
  const generateReferralNotes = useTriageStore((s) => s.generateReferralNotes);
  const fullResult = useTriageStore((s) => s.fullResult);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedBroker, setCopiedBroker] = useState(false);

  const copyAll = async () => {
    if (!referralNotes) return;
    const text = [
      "REFERRAL NOTES — Market Lane Insurance Group",
      "",
      "RISK OVERVIEW",
      referralNotes.risk_overview,
      "",
      "KEY CONCERNS",
      ...referralNotes.key_concerns.map((c) => `• ${c}`),
      "",
      "RECOMMENDED TERMS",
      ...referralNotes.recommended_terms.map((t) => `• ${t}`),
      "",
      "SUGGESTED EXCLUSIONS",
      ...referralNotes.suggested_exclusions.map((e) => `• ${e}`),
      "",
      "PREMIUM CONSIDERATIONS",
      referralNotes.premium_considerations,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyBroker = async () => {
    if (!referralNotes) return;
    await navigator.clipboard.writeText(referralNotes.broker_response_draft);
    setCopiedBroker(true);
    setTimeout(() => setCopiedBroker(false), 2000);
  };

  // Pre-generation state
  if (!referralNotes && !referralNotesLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ml-navy/5">
            <FileText className="h-6 w-6 text-ml-gold" />
          </div>
          <h3 className="font-serif text-heading-2 text-ml-navy mb-2">Referral Notes</h3>
          <p className="text-sm text-ml-navy/40 mb-6 leading-relaxed">
            Generate a polished underwriter-ready summary with risk overview, recommended terms,
            suggested exclusions, premium considerations, and a draft broker response email.
          </p>
          <button
            onClick={generateReferralNotes}
            disabled={!fullResult}
            className="rounded bg-ml-navy px-6 py-2.5 text-sm font-medium text-white tracking-wide hover:bg-ml-navy-light disabled:opacity-30 transition-all"
          >
            Generate Referral Notes
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (referralNotesLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-ml-gold" />
        <p className="text-sm text-ml-gold-dark font-medium">Generating underwriter-ready summary...</p>
      </div>
    );
  }

  if (!referralNotes) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-heading-2 text-ml-navy">Referral Notes</h3>
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 rounded border border-ml-navy/10 px-3 py-1.5 text-xs text-ml-navy/50 hover:text-ml-navy hover:border-ml-gold/30 transition-all"
          >
            {copiedAll ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            {copiedAll ? "Copied" : "Copy All"}
          </button>
        </div>

        {/* Risk Overview */}
        <div className="ml-card rounded-lg bg-white p-5 animate-fade-in">
          <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider mb-2">Risk Overview</p>
          {referralNotes.risk_overview.split("\n").map((para, i) => (
            <p key={i} className="text-sm text-ml-navy/60 leading-relaxed [&:not(:first-child)]:mt-2">
              {para}
            </p>
          ))}
        </div>

        {/* Key Concerns */}
        <div className="ml-card rounded-lg bg-white p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: "100ms" }}>
          <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider mb-2">Key Concerns</p>
          <ul className="space-y-1.5">
            {referralNotes.key_concerns.map((concern, i) => (
              <li key={i} className="text-sm text-ml-navy/60 pl-4 relative before:content-[''] before:absolute before:left-0.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-red-400">
                {concern}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Terms */}
        <div className="ml-card rounded-lg bg-white p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: "200ms" }}>
          <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider mb-2">Recommended Terms</p>
          <ul className="space-y-1.5">
            {referralNotes.recommended_terms.map((term, i) => (
              <li key={i} className="text-sm text-ml-navy/60 pl-4 relative before:content-[''] before:absolute before:left-0.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-ml-gold">
                {term}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Exclusions */}
        <div className="ml-card rounded-lg bg-white p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: "300ms" }}>
          <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider mb-2">Suggested Exclusions</p>
          <ul className="space-y-1.5">
            {referralNotes.suggested_exclusions.map((exc, i) => (
              <li key={i} className="text-sm text-ml-navy/60 pl-4 relative before:content-[''] before:absolute before:left-0.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-amber-500">
                {exc}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Considerations */}
        <div className="ml-card rounded-lg bg-white p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: "400ms" }}>
          <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider mb-2">Premium Considerations</p>
          <p className="text-sm text-ml-navy/60 leading-relaxed">{referralNotes.premium_considerations}</p>
        </div>

        {/* Broker Response Draft */}
        <div className="ml-card rounded-lg bg-white overflow-hidden animate-fade-in-up" style={{ opacity: 0, animationDelay: "500ms" }}>
          <div className="flex items-center justify-between border-b border-ml-navy/5 px-5 py-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-ml-gold" />
              <p className="text-[10px] font-semibold text-ml-navy/35 uppercase tracking-wider">Broker Response Draft</p>
            </div>
            <button
              onClick={copyBroker}
              className="flex items-center gap-1.5 rounded border border-ml-navy/10 px-2.5 py-1 text-[11px] text-ml-navy/50 hover:text-ml-navy hover:border-ml-gold/30 transition-all"
            >
              {copiedBroker ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              {copiedBroker ? "Copied" : "Copy Email"}
            </button>
          </div>
          <div className="p-5 bg-ml-cream/50">
            <pre className="whitespace-pre-wrap text-sm text-ml-navy/60 leading-relaxed font-sans">
              {referralNotes.broker_response_draft}
            </pre>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
