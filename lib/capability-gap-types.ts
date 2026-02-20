/** Module 2.2: Capability Gap Analysis™ – types */

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type GapDimension =
  | 'data_collection'
  | 'data_storage'
  | 'data_integration'
  | 'data_governance'
  | 'data_accessibility'
  | 'automation'
  | 'ai_usage'
  | 'deployment';

/** Summary of a data maturity assessment (Module 0.2). */
export interface DataMaturitySummary {
  maturity_stage: number; // 1-6
  maturity_index: number; // 0-100
  collection_score?: number;
  storage_score?: number;
  integration_score?: number;
  governance_score?: number;
  accessibility_score?: number;
}

/** Summary of an AI maturity assessment (Module 0.3). */
export interface AIMaturitySummary {
  maturity_stage: number; // 1-7
  maturity_score: number; // 0-100
  automation_score?: number;
  ai_usage_score?: number;
  deployment_score?: number;
}

export interface CapabilityGapInputs {
  data_maturity: DataMaturitySummary;
  ai_maturity: AIMaturitySummary;
  target_data_stage?: number; // default: 6
  target_ai_stage?: number;   // default: 7
}

/** A single identified gap (before prioritization). */
export interface IdentifiedGap {
  id: string;
  description: string;
  dimension: GapDimension;
  current_score?: number;
  required_stage?: number;
  effort_estimate?: 'low' | 'medium' | 'high';
}

/** A gap with priority and theme (after prioritize_gaps). */
export interface CapabilityGapResult {
  id: string;
  description: string;
  dimension: GapDimension;
  priority_level: PriorityLevel;
  grouped_theme: string;
  current_score?: number;
  effort_estimate?: 'low' | 'medium' | 'high';
}

export interface CapabilityGapAnalysisOutput {
  gaps: CapabilityGapResult[];
  analysis_date: string; // ISO
  inputs_summary?: {
    data_maturity_stage: number;
    data_maturity_index: number;
    ai_maturity_stage: number;
    ai_maturity_score: number;
  };
  /** Dimension scores for radar: current vs ideal (100). */
  dimension_scores?: { dimension: GapDimension; current: number; ideal: number }[];
}
