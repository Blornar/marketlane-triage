export const FIELD_LABELS: Record<string, string> = {
  insured_name: "Insured Name",
  abn_acn: "ABN/ACN",
  business_description: "Business Description",
  industry_category: "Industry / Occupancy Type",
  annual_revenue: "Annual Revenue / Turnover",
  number_of_employees: "Number of Employees",
  location_primary: "Primary Location",
  location_additional: "Additional Locations",
  coverage_requested: "Coverage Requested",
  policy_period: "Policy Period / Expiry Date",
  sum_insured: "Sum Insured",
  deductible_preference: "Deductible Preference",
  claims_history: "Claims History",
  broker_name: "Broker Name",
  broker_company: "Broker Company",
  key_risks: "Key Risks / Hazards",
  special_conditions: "Special Conditions / Notes",
};

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_TEXT_LENGTH = 50000;

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "message/rfc822",
  "image/png",
  "image/jpeg",
  "image/jpg",
  ".txt",
  ".eml",
  ".pdf",
];

export const WORKFLOW_STEPS = [
  { key: "upload" as const, label: "Upload" },
  { key: "extracting" as const, label: "Extract" },
  { key: "routing" as const, label: "Route" },
  { key: "assessing" as const, label: "Assess" },
  { key: "complete" as const, label: "Complete" },
];
