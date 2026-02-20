/** Module 2.3: Executive Dashboard™ – types for aggregated and prepared data */

export interface DashboardMaturity {
  data_maturity_index: number;
  data_maturity_stage: number;
  ai_maturity_score: number;
  ai_maturity_stage: number;
  data_created_at?: string;
  ai_created_at?: string;
}

export interface DashboardClassification {
  classification_string: string;
  matrix_x: number;
  matrix_y: number;
  risk: string;
  opportunity?: string;
  created_at?: string;
}

export interface DashboardFinancial {
  revenue_upside: number;
  profit_margin_expansion_value: number;
  cost_reduction: number;
  total_impact: number;
  revenue_upside_formatted: string;
  margin_formatted: string;
  cost_reduction_formatted: string;
  total_formatted: string;
  created_at?: string;
}

export interface DashboardROI {
  total_investment: number;
  expected_roi_pct: number | null;
  payback_period_years: number | null;
  total_investment_formatted: string;
  created_at?: string;
}

export interface DashboardRisk {
  overall_risk_score: number;
  risk_level: string;
  ai_misalignment: number;
  infrastructure: number;
  operational: number;
  strategic: number;
  created_at?: string;
}

export interface DashboardRoadmap {
  phase_count: number;
  total_estimated_cost: number;
  total_projected_impact: number;
  total_cost_formatted: string;
  total_impact_formatted: string;
  phases: { name: string; estimated_cost: number; projected_impact_value: number }[];
  generation_date?: string;
}

export interface ExecutiveDashboardData {
  organisation_id: string;
  maturity: DashboardMaturity | null;
  classification: DashboardClassification | null;
  financial: DashboardFinancial | null;
  roi: DashboardROI | null;
  risk: DashboardRisk | null;
  roadmap: DashboardRoadmap | null;
  /** For trend indicators: previous period values if available */
  trends?: {
    data_maturity_index_delta?: number;
    ai_maturity_score_delta?: number;
  };
}
