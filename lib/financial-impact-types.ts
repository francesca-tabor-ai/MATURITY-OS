/** Module 1.1: Financial Impact Engine™ – types */

export interface IndustryBenchmark {
  id: string;
  name: string;
  revenue_upside_multiplier?: number; // e.g. 1.2 for 20% higher upside in this industry
  margin_expansion_multiplier?: number;
  cost_reduction_multiplier?: number;
}

export interface FinancialImpactInputs {
  revenue: number;
  profit_margin_pct: number;
  headcount: number;
  operational_cost?: number;
  data_maturity_score: number;
  ai_maturity_score: number;
  industry_benchmark?: IndustryBenchmark;
}

export interface FinancialImpactOutput {
  revenue_upside: number;
  profit_margin_expansion_pct: number;
  profit_margin_expansion_value: number;
  cost_reduction: number;
  details?: {
    revenue_upside_pct?: number;
    sensitivity?: Record<string, unknown>;
  };
}
