/** Module 1.2: ROI & Investment Calculator™ – types */

export interface ROIInvestmentInputs {
  current_data_maturity: number;   // 0-100 score
  target_data_maturity: number;
  current_ai_maturity: number;
  target_ai_maturity: number;
  estimated_financial_benefits: number;  // total annual or one-time benefit used for ROI
  annual_benefits?: number;              // if different from estimated (e.g. annualized)
}

export interface ROIInvestmentOutput {
  required_data_investment: number;
  required_ai_investment: number;
  total_investment: number;
  expected_roi_pct: number | null;
  expected_roi_multiplier: number | null;
  payback_period_years: number | null;
  payback_period_months: number | null;
  details?: Record<string, unknown>;
}
