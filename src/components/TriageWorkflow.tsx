"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, FileText, ChevronLeft } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";
import { WORKFLOW_STEPS, TAB_GROUPS, ALL_TABS, TabGroup } from "@/lib/constants";
import UploadZone from "./UploadZone";
import SubmissionViewer from "./SubmissionViewer";
import ExtractionPanel from "./ExtractionPanel";
import BrandRouting from "./BrandRouting";
import RiskAssessment from "./RiskAssessment";
import MissingFields from "./MissingFields";
import LossScenarios from "./LossScenarios";
import PolicyRecommendations from "./PolicyRecommendations";
import CompletenessGauge from "./CompletenessGauge";
import ReferralNotes from "./ReferralNotes";
import ChatPanel from "./ChatPanel";

function StepIndicator() {
  const currentStep = useTriageStore((s) => s.step);
  const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STEPS.map((step, index) => {
        const isActive = index === stepIndex;
        const isComplete = index < stepIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-500 ${
                  isActive
                    ? "bg-ml-gold text-ml-navy animate-gentle-pulse"
                    : isComplete
                      ? "bg-ml-navy text-white"
                      : "bg-transparent border border-ml-navy/20 text-ml-navy/30"
                }`}
              >
                {isComplete ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs font-medium tracking-wide uppercase transition-colors duration-300 ${
                  isActive
                    ? "text-ml-gold-dark"
                    : isComplete
                      ? "text-ml-navy"
                      : "text-ml-navy/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <div
                className={`mx-3 h-px w-6 transition-colors duration-500 ${
                  isComplete ? "bg-ml-navy/30" : "bg-ml-navy/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MLHeader({ showReset }: { showReset: boolean }) {
  const reset = useTriageStore((s) => s.reset);

  return (
    <header className="bg-ml-navy">
      <div className="mx-auto flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-8 min-w-0">
          <div className="flex flex-col shrink-0">
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-white leading-none">
              MarketLane.
            </span>
            <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-[0.25em] uppercase text-ml-gold-light mt-0.5">
              Insurance Group
            </span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <span className="text-sm font-sans font-medium text-white/70 tracking-wide hidden sm:block">
            Submission Triage
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <div className="hidden lg:block">
            <StepIndicator />
          </div>
          {showReset && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded border border-white/20 px-3 py-1.5 text-xs font-medium text-white/70 tracking-wide uppercase hover:bg-white/5 hover:text-white transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              New
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  extraction: ExtractionPanel,
  routing: BrandRouting,
  risk: RiskAssessment,
  missing: MissingFields,
  scenarios: LossScenarios,
  recommendations: PolicyRecommendations,
  completeness: CompletenessGauge,
  referral: ReferralNotes,
};

function SectionNotificationDot({ group }: { group: TabGroup }) {
  const lossScenarios = useTriageStore((s) => s.lossScenarios);
  const completenessScore = useTriageStore((s) => s.completenessScore);
  const policyRecommendations = useTriageStore((s) => s.policyRecommendations);
  const referralNotes = useTriageStore((s) => s.referralNotes);

  let hasData = false;
  if (group === "insights") {
    hasData = lossScenarios.length > 0 || completenessScore !== null || policyRecommendations.length > 0;
  } else if (group === "actions") {
    hasData = referralNotes !== null;
  }

  if (!hasData) return null;
  return <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-ml-gold" />;
}

export default function TriageWorkflow() {
  const step = useTriageStore((s) => s.step);
  const error = useTriageStore((s) => s.error);
  const reset = useTriageStore((s) => s.reset);
  const metadata = useTriageStore((s) => s.metadata);
  const [activeGroup, setActiveGroup] = useState<TabGroup>("analysis");
  const [mobileShowSource, setMobileShowSource] = useState(false);

  const isUpload = step === "upload";
  const groupTabs = ALL_TABS.filter((t) => t.group === activeGroup);
  const defaultTab = groupTabs[0]?.id || "extraction";

  return (
    <div className="flex h-screen flex-col bg-ml-cream overflow-x-hidden">
      <MLHeader showReset={!isUpload} />
      <div className="ml-gold-line" />

      {error && (
        <div className="mx-4 sm:mx-8 mt-4 rounded border border-red-200 bg-red-50 px-4 sm:px-5 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={reset}
            className="text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-900 shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {isUpload ? (
          <div className="h-full overflow-y-auto py-8 sm:py-12 px-4 sm:px-8">
            <UploadZone />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left pane: submission viewer — full screen overlay on mobile */}
              <div className={`${
                mobileShowSource
                  ? "fixed inset-0 z-40 bg-white flex flex-col"
                  : "hidden"
              } md:relative md:flex md:flex-col md:w-[38%] md:z-auto border-r border-ml-navy/5 bg-white`}>
                {/* Mobile close button */}
                <div className="flex items-center justify-between border-b border-ml-navy/5 px-4 py-2.5 md:hidden">
                  <button
                    onClick={() => setMobileShowSource(false)}
                    className="flex items-center gap-1.5 text-sm font-medium text-ml-navy/60"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Analysis
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <SubmissionViewer />
                </div>
              </div>

              {/* Right pane: sectioned tabs */}
              <div className="flex-1 flex flex-col overflow-hidden bg-ml-cream">
                {/* Mobile: view source button */}
                <div className="flex items-center gap-2 border-b border-ml-navy/5 bg-white px-4 py-2 md:hidden">
                  <button
                    onClick={() => setMobileShowSource(true)}
                    className="flex items-center gap-1.5 rounded bg-ml-navy/5 px-3 py-1.5 text-xs font-medium text-ml-navy/60 hover:bg-ml-navy/10 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Source Document
                  </button>
                </div>

                {/* Section selector */}
                <div className="border-b border-ml-navy/5 bg-white px-3 sm:px-6">
                  <div className="flex items-center gap-0.5 sm:gap-1 pt-3 overflow-x-auto scrollbar-hide">
                    {TAB_GROUPS.map((group) => (
                      <button
                        key={group.key}
                        onClick={() => setActiveGroup(group.key)}
                        className={`relative shrink-0 rounded-t px-3 sm:px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all ${
                          activeGroup === group.key
                            ? "bg-ml-cream text-ml-navy border border-ml-navy/5 border-b-transparent -mb-px"
                            : "text-ml-navy/30 hover:text-ml-navy/50"
                        }`}
                      >
                        {group.label}
                        <SectionNotificationDot group={group.key} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab bar for active section */}
                <Tabs key={activeGroup} defaultValue={defaultTab} className="flex h-full flex-col">
                  <div className="border-b border-ml-navy/5 bg-ml-cream/50 px-3 sm:px-6 pt-2 overflow-x-auto scrollbar-hide">
                    <TabsList className="bg-transparent p-0 gap-0 w-max">
                      {groupTabs.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="shrink-0 rounded-none border-b-2 border-transparent px-3 sm:px-4 pb-2.5 pt-1 text-sm font-medium tracking-wide data-[state=active]:border-ml-gold data-[state=active]:text-ml-navy data-[state=active]:bg-transparent data-[state=active]:shadow-none text-ml-navy/40 hover:text-ml-navy/60 bg-transparent"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {groupTabs.map((tab) => {
                      const Component = TAB_COMPONENTS[tab.id];
                      return (
                        <TabsContent key={tab.id} value={tab.id} className="h-full mt-0">
                          {Component ? <Component /> : null}
                        </TabsContent>
                      );
                    })}
                  </div>
                </Tabs>

                {metadata && (
                  <div className="border-t border-ml-navy/5 bg-white px-4 sm:px-6 py-2 text-xs text-ml-navy/40 font-sans">
                    Processed in {(metadata.processing_time_ms / 1000).toFixed(1)}s · {metadata.model_used}
                  </div>
                )}
              </div>
            </div>

            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  );
}
