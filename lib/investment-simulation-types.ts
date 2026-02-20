/**
 * Module 6.1: AI Investment Simulation Engine™ – types
 */

export type TargetArea = 'data' | 'ai' | 'both';

export interface InvestmentScenarioInput {
  investment_amount: number;
  target_area: TargetArea;
  time_horizon_years: number;
  /** Optional: current revenue for profit/revenue projection (from financial impact model) */
  current_revenue?: number;
  /** Optional: current profit margin % */
  current_margin_pct?: number;
}

export interface SimulationResult {
  scenario_index: number;
  investment_amount: number;
  target_area: TargetArea;
  time_horizon_years: number;
  /** Maturity improvement (points) achieved in target area(s) */
  simulated_data_maturity_improvement: number;
  simulated_ai_maturity_improvement: number;
  /** Resulting maturity scores (current + improvement, capped at 100) */
  projected_data_maturity: number;
  projected_ai_maturity: number;
  /** Financial projections over the horizon */
  projected_profit_increase: number;
  projected_revenue_increase: number;
  /** Years to reach ~90% of benefit (delay / ramp) */
  effective_time_to_benefit_years: number;
  /** Annualised benefit in final year */
  annualised_benefit_year_end: number;
  /** ROI-like: total projected profit increase / investment */
  return_per_unit: number;
}

export interface ScenarioComparisonItem {
  scenario_index: number;
  investment_amount: number;
  target_area: TargetArea;
  projected_profit_increase: number;
  return_per_unit: number;
  effective_time_to_benefit_years: number;
  rank_by_impact: number;
  rank_by_cost_effectiveness: number;
  risk_indicator: 'low' | 'medium' | 'high';
}

export interface ComparisonResult {
  scenarios: ScenarioComparisonItem[];
  best_by_impact: number;
  best_by_cost_effectiveness: number;
}
