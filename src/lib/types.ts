export type BrandName =
  | "The Barn"
  | "G.O.A.T."
  | "Kokomo"
  | "Square Mile"
  | "Fairlight"
  | "Back Bay"
  | "ML Specialty"
  | "MLX Risk Partners";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type Severity = "RED" | "AMBER" | "GREEN";
export type Importance = "CRITICAL" | "IMPORTANT" | "OPTIONAL";
export type TriageStep = "upload" | "extracting" | "routing" | "assessing" | "complete";

export interface ExtractedField {
  value: string;
  confidence: Confidence;
  source_text: string;
}

export interface MissingField {
  field_name: string;
  importance: Importance;
  suggested_question: string;
}

export interface BrandMatch {
  brand: BrandName;
  score: number;
  reasoning: string;
}

export interface BrandRouting {
  primary_brand: BrandName;
  primary_score: number;
  primary_reasoning: string;
  secondary_brands: BrandMatch[];
  decline_reasons: string[];
}

export interface RiskFlag {
  severity: Severity;
  category: string;
  description: string;
}

export interface RiskAssessment {
  summary_narrative: string;
  risk_flags: RiskFlag[];
  follow_up_questions: string[];
}

export interface TriageMetadata {
  processing_time_ms: number;
  model_used: string;
  submission_type: "email" | "pdf" | "manual" | "sample";
}

export interface TriageResult {
  extracted_fields: Record<string, ExtractedField>;
  missing_fields: MissingField[];
  brand_routing: BrandRouting;
  risk_assessment: RiskAssessment;
  metadata: TriageMetadata;
}

// SSE event types sent from server to client
export type SSEEvent =
  | { type: "step"; step: TriageStep }
  | { type: "field"; name: string; field: ExtractedField }
  | { type: "brand_routing"; data: BrandRouting }
  | { type: "risk_assessment"; data: RiskAssessment }
  | { type: "missing_fields"; data: MissingField[] }
  | { type: "metadata"; data: TriageMetadata }
  | { type: "complete"; data: TriageResult }
  | { type: "error"; message: string }
  | { type: "ping" };

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SampleSubmission {
  id: string;
  title: string;
  subtitle: string;
  brandHint: BrandName;
  icon: string;
  content: string;
}
