/** Core Module 0.4: Maturity Classification Engine™ – types */

export type RiskClassification = 'Low' | 'Medium' | 'High';
export type OpportunityClassification =
  | 'Data Infrastructure Upgrade'
  | 'AI Adoption Acceleration'
  | 'Data & AI Balance'
  | 'Scale Data & AI'
  | 'Optimise & Innovate'
  | 'Sustain Excellence'
  | 'Foundation First'
  | 'Quick Wins on Data'
  | 'Pilot AI'
  | string;

export interface ClassificationResult {
  classification_string: string;
  matrix_x_coordinate: number;
  matrix_y_coordinate: number;
  risk_classification: RiskClassification;
  opportunity_classification: OpportunityClassification;
  details?: Record<string, unknown>;
}

/** Rule: min/max bounds for data_index and ai_score (inclusive), and resulting outputs */
export interface ClassificationRule {
  id: string;
  name: string;
  data_index_min: number;
  data_index_max: number;
  ai_score_min: number;
  ai_score_max: number;
  classification_string: string;
  risk: RiskClassification;
  opportunity: OpportunityClassification;
}

export interface ClassificationRulesConfig {
  version?: string;
  rules: ClassificationRule[];
}
