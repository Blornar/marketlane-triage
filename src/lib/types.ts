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

// Loss Scenario Modelling
export type ScenarioSeverity = "catastrophic" | "major" | "moderate" | "minor";
export type ScenarioLikelihood = "high" | "medium" | "low" | "rare";

export interface LossScenario {
  title: string;
  description: string;
  severity: ScenarioSeverity;
  likelihood: ScenarioLikelihood;
  financial_impact_low: number;
  financial_impact_high: number;
}

// Submission Completeness Score
export interface CompletenessCategory {
  category: string;
  score: number;
  fields_present: string[];
  fields_missing: string[];
}

export interface CompletenessScore {
  overall_score: number;
  grade: "excellent" | "good" | "fair" | "poor" | "insufficient";
  categories: CompletenessCategory[];
  summary: string;
}

// Policy Wording Recommendations
export type RecommendationType = "exclusion" | "endorsement" | "subjectivity" | "condition";
export type RecommendationPriority = "essential" | "recommended" | "consider";

export interface PolicyRecommendation {
  type: RecommendationType;
  text: string;
  reasoning: string;
  priority: RecommendationPriority;
}

// Referral Notes (separate API call)
export interface ReferralNotes {
  risk_overview: string;
  key_concerns: string[];
  recommended_terms: string[];
  suggested_exclusions: string[];
  premium_considerations: string;
  broker_response_draft: string;
}

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
  loss_scenarios: LossScenario[];
  completeness_score: CompletenessScore;
  policy_recommendations: PolicyRecommendation[];
  metadata: TriageMetadata;
}

// SSE event types sent from server to client
export type SSEEvent =
  | { type: "step"; step: TriageStep }
  | { type: "field"; name: string; field: ExtractedField }
  | { type: "brand_routing"; data: BrandRouting }
  | { type: "risk_assessment"; data: RiskAssessment }
  | { type: "missing_fields"; data: MissingField[] }
  | { type: "loss_scenarios"; data: LossScenario[] }
  | { type: "completeness_score"; data: CompletenessScore }
  | { type: "policy_recommendations"; data: PolicyRecommendation[] }
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
