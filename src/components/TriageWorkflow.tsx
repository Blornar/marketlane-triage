"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";
import { WORKFLOW_STEPS } from "@/lib/constants";
import UploadZone from "./UploadZone";
import SubmissionViewer from "./SubmissionViewer";
import ExtractionPanel from "./ExtractionPanel";
import BrandRouting from "./BrandRouting";
import RiskAssessment from "./RiskAssessment";
import MissingFields from "./MissingFields";
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
      <div className="mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          {/* Market Lane wordmark */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tracking-tight text-white leading-none">
              MarketLane.
            </span>
            <span className="text-[10px] font-sans font-medium tracking-[0.25em] uppercase text-ml-gold-light mt-0.5">
              Insurance Group
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <span className="text-sm font-sans font-medium text-white/70 tracking-wide">
            Submission Triage
          </span>
        </div>
        <div className="flex items-center gap-6">
          <StepIndicator />
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

export default function TriageWorkflow() {
  const step = useTriageStore((s) => s.step);
  const error = useTriageStore((s) => s.error);
  const reset = useTriageStore((s) => s.reset);
  const metadata = useTriageStore((s) => s.metadata);

  const isUpload = step === "upload";

  return (
    <div className="flex h-screen flex-col bg-ml-cream">
      <MLHeader showReset={!isUpload} />

      {/* Gold accent line */}
      <div className="ml-gold-line" />

      {/* Error banner */}
      {error && (
        <div className="mx-8 mt-4 rounded border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={reset}
            className="text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {isUpload ? (
          <div className="h-full overflow-y-auto py-12 px-8">
            <UploadZone />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex flex-1 overflow-hidden">
              {/* Left pane: submission viewer */}
              <div className="w-[38%] border-r border-ml-navy/5 bg-white">
                <SubmissionViewer />
              </div>

              {/* Right pane: analysis tabs */}
              <div className="flex-1 flex flex-col overflow-hidden bg-ml-cream">
                <Tabs defaultValue="extraction" className="flex h-full flex-col">
                  <div className="border-b border-ml-navy/5 bg-white px-6 pt-4">
                    <TabsList className="bg-transparent p-0 gap-0">
                      {["extraction", "routing", "risk", "missing"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-1 text-sm font-medium capitalize tracking-wide data-[state=active]:border-ml-gold data-[state=active]:text-ml-navy data-[state=active]:bg-transparent data-[state=active]:shadow-none text-ml-navy/40 hover:text-ml-navy/60 bg-transparent"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="extraction" className="h-full mt-0">
                      <ExtractionPanel />
                    </TabsContent>
                    <TabsContent value="routing" className="h-full mt-0">
                      <BrandRouting />
                    </TabsContent>
                    <TabsContent value="risk" className="h-full mt-0">
                      <RiskAssessment />
                    </TabsContent>
                    <TabsContent value="missing" className="h-full mt-0">
                      <MissingFields />
                    </TabsContent>
                  </div>
                </Tabs>

                {/* Processing time */}
                {metadata && (
                  <div className="border-t border-ml-navy/5 bg-white px-6 py-2 text-xs text-ml-navy/40 font-sans">
                    Processed in {(metadata.processing_time_ms / 1000).toFixed(1)}s · {metadata.model_used}
                  </div>
                )}
              </div>
            </div>

            {/* Chat panel at bottom */}
            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  );
}
