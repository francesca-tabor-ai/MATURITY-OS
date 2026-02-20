/**
 * Module 4.2: Portfolio Intelligence Dashboard™
 * Types for aggregated portfolio data and performance analysis.
 */

/** Single company row in the portfolio with latest metrics from all modules */
export interface PortfolioCompany {
  organisation_id: string;
  name: string;
  industry: string | null;
  /** Latest data maturity index (0–100) */
  data_maturity_index: number | null;
  /** Latest AI maturity score (0–100) */
  ai_maturity_score: number | null;
  /** Latest revenue upside (£) */
  revenue_upside: number | null;
  /** Latest profit margin expansion value (£) */
  profit_margin_expansion_value: number | null;
  /** Latest cost reduction (£) */
  cost_reduction: number | null;
  /** Latest total investment (£) */
  total_investment: number | null;
  /** Latest expected ROI % */
  expected_roi_pct: number | null;
  /** Latest payback period (years) */
  payback_period_years: number | null;
  /** Latest overall risk score (0–100) */
  overall_risk_score: number | null;
  /** Latest risk level */
  risk_level: string | null;
  /** Latest current valuation (£) */
  current_valuation: number | null;
  /** Latest potential valuation (£) */
  potential_valuation: number | null;
  /** Latest valuation upside (£) */
  valuation_upside: number | null;
  /** Latest valuation upside % */
  valuation_upside_pct: number | null;
}

/** Full payload returned by the portfolio intelligence service (for dashboard) */
export interface PortfolioIntelligenceData {
  companies: PortfolioCompany[];
  industry_filter: string | null;
  industries: string[];
}

/** Portfolio-level metrics and top/bottom performers */
export interface PortfolioPerformance {
  company_count: number;
  /** Average data maturity across companies with data */
  avg_data_maturity: number;
  /** Average AI maturity across companies with data */
  avg_ai_maturity: number;
  /** Total revenue upside (£) */
  total_revenue_upside: number;
  /** Total profit margin expansion value (£) */
  total_profit_expansion: number;
  /** Total cost reduction (£) */
  total_cost_reduction: number;
  /** Total financial impact (revenue + profit expansion + cost reduction) */
  total_financial_impact: number;
  /** Average risk score (0–100); lower is better */
  avg_risk_score: number;
  /** Total valuation upside (£) from latest company_valuations */
  total_valuation_upside: number;
  /** Top companies by valuation upside % (or £) */
  top_by_valuation_upside: PortfolioCompany[];
  /** Bottom companies by average maturity (data+AI)/2 */
  bottom_by_maturity: PortfolioCompany[];
  /** Top companies by revenue upside */
  top_by_revenue_upside: PortfolioCompany[];
}
