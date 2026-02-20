/**
 * Module 6.2: Strategic Decision Simulator™ – types
 */

export type InvestmentLevel = 'low' | 'medium' | 'high';
export type AdoptionPace = 'conservative' | 'moderate' | 'aggressive';
export type MarketConditions = 'stable' | 'volatile' | 'growth';
export type CompetitiveAction = 'status_quo' | 'invests_heavily';

export interface ScenarioParameters {
  investment_level: InvestmentLevel;
  adoption_pace: AdoptionPace;
  market_conditions: MarketConditions;
  competitive_action: CompetitiveAction;
  /** Optional: explicit investment amount (£) */
  investment_amount?: number;
  /** Optional: time horizon in years (default 5) */
  horizon_years?: number;
}

export interface StrategicScenario {
  name: string;
  parameters: ScenarioParameters;
}

/** One year in the simulation */
export interface YearlyOutcome {
  year: number;
  data_maturity: number;
  ai_maturity: number;
  revenue: number;
  profit: number;
  valuation: number;
  competitive_score: number;
  risk_score: number;
}

export interface SimulationOutcome {
  scenario_name: string;
  parameters: ScenarioParameters;
  horizon_years: number;
  yearly: YearlyOutcome[];
  /** End-state summary */
  end_data_maturity: number;
  end_ai_maturity: number;
  end_revenue: number;
  end_profit: number;
  end_valuation: number;
  end_competitive_score: number;
  end_risk_score: number;
  /** Aggregates */
  total_profit_over_horizon: number;
  avg_risk_over_horizon: number;
}

export interface ScenarioRecommendation {
  scenario_index: number;
  scenario_name: string;
  objective: 'maximize_profit' | 'minimize_risk' | 'balance';
  score: number;
  trade_offs: string[];
  risks: string[];
}

export interface OutcomeAnalysis {
  outcomes: SimulationOutcome[];
  best_by_profit: number;
  best_by_risk: number;
  best_balanced: number;
  recommendations: ScenarioRecommendation[];
}
