"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, ClipboardPaste } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTriageStore } from "@/store/triageStore";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/constants";
import SampleSelector from "./SampleSelector";

export default function UploadZone() {
  const [dragOver, setDragOver] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startTriageFromFile = useTriageStore((s) => s.startTriageFromFile);
  const startTriageFromText = useTriageStore((s) => s.startTriageFromText);

  const handleFile = useCallback(
    (file: File) => {
      setFileError(null);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        return;
      }
      startTriageFromFile(file);
    },
    [startTriageFromFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePasteSubmit = () => {
    if (pasteText.trim()) {
      startTriageFromText(pasteText.trim());
    }
  };

  return (
    <div className="mx-auto max-w-2xl w-full">
      {/* Title area */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-serif text-display text-ml-navy mb-3">
          Submission Triage.
        </h1>
        <p className="text-lg text-ml-navy/50 font-light max-w-md mx-auto">
          AI-powered analysis, brand routing, and risk assessment for incoming broker submissions.
        </p>
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all duration-300 animate-fade-in-up delay-100 ${
          dragOver
            ? "border-ml-gold bg-ml-gold/5"
            : "border-ml-navy/15 hover:border-ml-gold/50 hover:bg-white"
        }`}
        style={{ opacity: 0 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.eml,.png,.jpg,.jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
          dragOver ? "bg-ml-gold/10" : "bg-ml-navy/5 group-hover:bg-ml-gold/10"
        }`}>
          <Upload className={`h-6 w-6 transition-colors duration-300 ${
            dragOver ? "text-ml-gold" : "text-ml-navy/30 group-hover:text-ml-gold"
          }`} />
        </div>
        <p className="text-base font-medium text-ml-navy">
          Drop a submission file here
        </p>
        <p className="mt-1.5 text-sm text-ml-navy/40">
          PDF, TXT, EML, PNG, or JPG — up to {MAX_FILE_SIZE_MB}MB
        </p>
        {fileError && (
          <p className="mt-3 text-sm text-red-700">{fileError}</p>
        )}
      </div>

      {/* Paste text toggle */}
      <div className="flex items-center gap-4 my-6 animate-fade-in-up delay-200" style={{ opacity: 0 }}>
        <div className="h-px flex-1 bg-ml-navy/8" />
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="flex items-center gap-2 text-xs font-medium text-ml-navy/40 hover:text-ml-gold-dark tracking-wide uppercase transition-colors"
        >
          {showPaste ? <FileText className="h-3.5 w-3.5" /> : <ClipboardPaste className="h-3.5 w-3.5" />}
          {showPaste ? "Hide text input" : "Or paste submission text"}
        </button>
        <div className="h-px flex-1 bg-ml-navy/8" />
      </div>

      {showPaste && (
        <div className="space-y-3 animate-fade-in">
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste broker email, submission notes, or any insurance submission text here..."
            className="min-h-[180px] resize-y bg-white border-ml-navy/10 text-ml-navy placeholder:text-ml-navy/25 focus:border-ml-gold focus:ring-ml-gold/20 rounded-lg"
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim()}
            className="rounded bg-ml-navy px-6 py-2.5 text-sm font-medium text-white tracking-wide hover:bg-ml-navy-light disabled:opacity-30 transition-all"
          >
            Analyse Submission
          </button>
        </div>
      )}

      {/* Sample submissions */}
      <div className="animate-fade-in-up delay-300" style={{ opacity: 0 }}>
        <p className="mb-4 text-xs font-medium text-ml-navy/40 tracking-wide uppercase">
          Or try a sample submission
        </p>
        <SampleSelector />
      </div>
    </div>
  );
}
