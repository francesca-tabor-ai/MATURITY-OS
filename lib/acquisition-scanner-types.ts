/**
 * Module 4.3: Acquisition Opportunity Scanner™ – types
 */

/** A company candidate for the scanner (with latest metrics) */
export interface AcquisitionCandidate {
  organisation_id: string;
  name: string;
  industry: string | null;
  current_valuation: number | null;
  data_maturity_index: number | null;
  ai_maturity_score: number | null;
  /** From company_valuations or computed */
  potential_valuation: number | null;
  valuation_upside: number | null;
  valuation_upside_pct: number | null;
  revenue_upside: number | null;
  overall_risk_score: number | null;
  risk_level: string | null;
  /** Estimated investment to improve maturity (from ROI module) */
  total_investment: number | null;
}

/** Industry benchmark for comparison (e.g. average maturity in sector) */
export interface IndustryBenchmark {
  industry: string;
  avg_data_maturity: number;
  avg_ai_maturity: number;
}

/** Result for one company from identify_undervalued_companies */
export interface UndervaluedCompany {
  organisation_id: string;
  name: string;
  industry: string | null;
  current_valuation: number;
  potential_valuation: number;
  valuation_upside: number;
  valuation_upside_pct: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  /** 0–100: higher = more undervalued (gap between current and intrinsic value) */
  undervaluation_score: number;
  rationale?: string;
}

/** Result for one company from score_acquisition_targets (ranked acquisition target) */
export interface AcquisitionTarget {
  organisation_id: string;
  name: string;
  industry: string | null;
  undervaluation_score: number;
  /** 0–100: composite score for acquisition attractiveness */
  acquisition_attractiveness_score: number;
  current_valuation: number;
  potential_valuation: number;
  valuation_upside_pct: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  revenue_upside: number | null;
  risk_level: string | null;
  /** Short rationale for the score */
  rationale?: string;
}

/** Filters for the scanner API */
export interface AcquisitionScannerFilters {
  industry?: string | null;
  min_valuation?: number | null;
  max_valuation?: number | null;
  min_data_maturity?: number | null;
  max_data_maturity?: number | null;
  min_ai_maturity?: number | null;
  max_ai_maturity?: number | null;
}
