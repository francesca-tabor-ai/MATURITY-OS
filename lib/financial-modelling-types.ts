/**
 * Platform Infrastructure — Financial Modelling Engine: types
 * Revenue, cost, and profit impact inputs/outputs; orchestrator report.
 */

import type { IndustryBenchmark } from './financial-impact-types';

/** Inputs for revenue impact (current revenue, maturity, optional industry growth) */
export interface RevenueImpactInputs {
  current_revenue: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  industry_growth_rate_pct?: number;
  industry_benchmark?: IndustryBenchmark;
}

/** Output: projected revenue increase and total potential revenue */
export interface RevenueImpactOutput {
  projected_revenue_increase: number;
  total_potential_revenue: number;
  revenue_increase_pct: number;
  model_used: 'maturity_gap' | 'growth_rate';
}

/** Inputs for cost impact */
export interface CostImpactInputs {
  operational_cost?: number;
  headcount: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  industry_benchmark?: IndustryBenchmark;
}

/** Areas of potential cost reduction (estimated savings by category) */
export interface CostReductionAreas {
  automation: number;
  process_efficiency: number;
  resource_optimization: number;
  other: number;
}

/** Output: cost savings and breakdown by area */
export interface CostImpactOutput {
  estimated_cost_savings: number;
  areas_of_reduction: CostReductionAreas;
  savings_as_pct_of_cost: number;
}

/** Inputs for profit impact (outputs of revenue + cost services, optional tax) */
export interface ProfitImpactInputs {
  revenue_impact: RevenueImpactOutput;
  cost_impact: CostImpactOutput;
  current_profit: number;
  tax_rate_pct?: number;
}

/** Output: net profit increase, tax-adjusted */
export interface ProfitImpactOutput {
  net_profit_increase: number;
  tax_adjusted_net_increase: number;
  total_profit_impact_pct: number;
}

/** Full input for the financial model orchestrator */
export interface FinancialModelInputs {
  organisation_id: string;
  current_revenue: number;
  profit_margin_pct: number;
  headcount: number;
  operational_cost?: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  industry_growth_rate_pct?: number;
  industry_benchmark?: IndustryBenchmark;
  tax_rate_pct?: number;
}

/** Aggregated report from the orchestrator */
export interface FinancialImpactReport {
  organisation_id: string;
  revenue_impact: RevenueImpactOutput;
  cost_impact: CostImpactOutput;
  profit_impact: ProfitImpactOutput;
  summary: {
    total_revenue_upside: number;
    total_cost_savings: number;
    net_profit_increase: number;
    tax_adjusted_profit_increase: number;
  };
  computed_at: string;
  errors?: string[];
}
