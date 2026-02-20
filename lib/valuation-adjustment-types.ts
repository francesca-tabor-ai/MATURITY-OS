/** Module 4.1: Company Valuation Adjustment Engine™ – types */

export interface ValuationInputs {
  current_valuation: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  /** Optional industry multiplier for valuation (e.g. 1.0–1.3) */
  industry_multiplier?: number;
}

export interface ValuationOutput {
  current_valuation: number;
  potential_valuation: number;
  valuation_upside: number;
  valuation_upside_pct: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  /** Short description of model and assumptions */
  model_explanation?: string;
}

export interface ValuationSensitivityPoint {
  data_maturity: number;
  ai_maturity: number;
  potential_valuation: number;
  valuation_upside: number;
  valuation_upside_pct: number;
}
