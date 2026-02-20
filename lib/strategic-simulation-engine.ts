/**
 * Module 6.2: Strategic Decision Simulator™
 * Scenario definition, multi-factor simulation, and outcome analysis.
 */

import type {
  ScenarioParameters,
  StrategicScenario,
  YearlyOutcome,
  SimulationOutcome,
  ScenarioRecommendation,
  OutcomeAnalysis,
} from './strategic-simulation-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Map parameter labels to numeric multipliers for simulation */
const INVESTMENT_MULT: Record<string, number> = { low: 0.4, medium: 1, high: 1.8 };
const PACE_MULT: Record<string, number> = { conservative: 0.6, moderate: 1, aggressive: 1.4 };
const MARKET_MULT: Record<string, number> = { stable: 1, volatile: 0.85, growth: 1.25 };
const COMPETITIVE_MULT: Record<string, number> = { status_quo: 1, invests_heavily: 0.9 };

/**
 * Build a structured scenario from parameter choices.
 */
export function define_strategic_scenario(
  name: string,
  parameters: ScenarioParameters
): StrategicScenario {
  return {
    name,
    parameters: {
      investment_level: parameters.investment_level ?? 'medium',
      adoption_pace: parameters.adoption_pace ?? 'moderate',
      market_conditions: parameters.market_conditions ?? 'stable',
      competitive_action: parameters.competitive_action ?? 'status_quo',
      investment_amount: parameters.investment_amount,
      horizon_years: parameters.horizon_years ?? 5,
    },
  };
}

export interface SimulationContext {
  current_data_maturity: number;
  current_ai_maturity: number;
  current_revenue: number;
  current_profit: number;
  current_valuation?: number;
}

/**
 * Multi-factor simulator: projects maturity, financials, competitive position, risk over horizon.
 */
export class StrategicDecisionSimulator {
  private scenario: StrategicScenario;
  private context: SimulationContext;

  constructor(scenario: StrategicScenario, context: SimulationContext) {
    this.scenario = scenario;
    this.context = context;
  }

  run(): SimulationOutcome {
    const p = this.scenario.parameters;
    const horizon = Math.min(10, Math.max(1, p.horizon_years ?? 5));
    const invMult = INVESTMENT_MULT[p.investment_level] ?? 1;
    const paceMult = PACE_MULT[p.adoption_pace] ?? 1;
    const marketMult = MARKET_MULT[p.market_conditions] ?? 1;
    const compMult = COMPETITIVE_MULT[p.competitive_action] ?? 1;

    let dataM = clamp(this.context.current_data_maturity, 0, 100);
    let aiM = clamp(this.context.current_ai_maturity, 0, 100);
    let revenue = Math.max(0, this.context.current_revenue);
    let profit = Math.max(0, this.context.current_profit);
    const valuation = this.context.current_valuation ?? revenue * 2.5;

    const dataGainPerYear = (invMult * paceMult * (p.investment_level === 'high' ? 12 : p.investment_level === 'medium' ? 7 : 4)) * marketMult * compMult;
    const aiGainPerYear = (invMult * paceMult * (p.investment_level === 'high' ? 10 : p.investment_level === 'medium' ? 6 : 3)) * marketMult * compMult;

    const yearly: YearlyOutcome[] = [];

    for (let y = 1; y <= horizon; y++) {
      dataM = clamp(dataM + dataGainPerYear * (1 - 0.05 * (y - 1)), 0, 100);
      aiM = clamp(aiM + aiGainPerYear * (1 - 0.05 * (y - 1)), 0, 100);
      const maturityFactor = (dataM + aiM) / 200;
      const revenueGrowth = 0.03 + maturityFactor * 0.08 * marketMult;
      revenue = revenue * (1 + revenueGrowth);
      const marginImprove = maturityFactor * 5;
      profit = revenue * (0.01 * (10 + marginImprove));
      const valMultiple = 2 + maturityFactor * 1.5;
      const simValuation = revenue * valMultiple;
      const competitiveScore = clamp((dataM + aiM) / 2 - (compMult < 1 ? 10 : 0), 0, 100);
      const riskScore = clamp(50 - maturityFactor * 20 + (p.market_conditions === 'volatile' ? 15 : 0), 0, 100);

      yearly.push({
        year: y,
        data_maturity: Math.round(dataM * 100) / 100,
        ai_maturity: Math.round(aiM * 100) / 100,
        revenue: Math.round(revenue * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        valuation: Math.round(simValuation * 100) / 100,
        competitive_score: Math.round(competitiveScore * 100) / 100,
        risk_score: Math.round(riskScore * 100) / 100,
      });
    }

    const last = yearly[yearly.length - 1];
    const totalProfit = yearly.reduce((s, x) => s + x.profit, 0);
    const avgRisk = yearly.reduce((s, x) => s + x.risk_score, 0) / yearly.length;

    return {
      scenario_name: this.scenario.name,
      parameters: p,
      horizon_years: horizon,
      yearly,
      end_data_maturity: last.data_maturity,
      end_ai_maturity: last.ai_maturity,
      end_revenue: last.revenue,
      end_profit: last.profit,
      end_valuation: last.valuation,
      end_competitive_score: last.competitive_score,
      end_risk_score: last.risk_score,
      total_profit_over_horizon: Math.round(totalProfit * 100) / 100,
      avg_risk_over_horizon: Math.round(avgRisk * 100) / 100,
    };
  }
}

/**
 * Compare outcomes and recommend strategies with trade-offs and risks.
 */
export function analyze_simulation_outcomes(outcomes: SimulationOutcome[]): OutcomeAnalysis {
  if (outcomes.length === 0) {
    return {
      outcomes: [],
      best_by_profit: 0,
      best_by_risk: 0,
      best_balanced: 0,
      recommendations: [],
    };
  }

  const byProfit = [...outcomes].sort((a, b) => b.total_profit_over_horizon - a.total_profit_over_horizon);
  const byRisk = [...outcomes].sort((a, b) => a.avg_risk_over_horizon - b.avg_risk_over_horizon);
  const profitIdx = new Map(outcomes.map((o, i) => [o.scenario_name, i]));
  const best_by_profit = profitIdx.get(byProfit[0].scenario_name) ?? 0;
  const best_by_risk = profitIdx.get(byRisk[0].scenario_name) ?? 0;

  let bestBalancedIdx = 0;
  let bestScore = -Infinity;
  const maxProfit = Math.max(...outcomes.map((o) => o.total_profit_over_horizon));
  const minRisk = Math.min(...outcomes.map((o) => o.avg_risk_over_horizon));
  outcomes.forEach((o, i) => {
    const profitNorm = maxProfit > 0 ? o.total_profit_over_horizon / maxProfit : 0;
    const riskNorm = minRisk < 100 ? 1 - (o.avg_risk_over_horizon - minRisk) / (100 - minRisk) : 0;
    const score = 0.6 * profitNorm + 0.4 * riskNorm;
    if (score > bestScore) {
      bestScore = score;
      bestBalancedIdx = i;
    }
  });

  const recommendations: ScenarioRecommendation[] = [];

  if (byProfit[0]) {
    recommendations.push({
      scenario_index: profitIdx.get(byProfit[0].scenario_name) ?? 0,
      scenario_name: byProfit[0].scenario_name,
      objective: 'maximize_profit',
      score: byProfit[0].total_profit_over_horizon,
      trade_offs: ['Highest total profit over horizon', 'May entail higher risk or investment'],
      risks: [byProfit[0].avg_risk_over_horizon > 50 ? 'Above-average risk exposure' : 'Moderate risk'],
    });
  }
  if (byRisk[0] && byRisk[0].scenario_name !== byProfit[0]?.scenario_name) {
    recommendations.push({
      scenario_index: profitIdx.get(byRisk[0].scenario_name) ?? 0,
      scenario_name: byRisk[0].scenario_name,
      objective: 'minimize_risk',
      score: 100 - byRisk[0].avg_risk_over_horizon,
      trade_offs: ['Lowest risk profile', 'Profit may be lower than aggressive scenarios'],
      risks: ['Conservative outcome may lag competitors in fast-moving markets'],
    });
  }
  recommendations.push({
    scenario_index: bestBalancedIdx,
    scenario_name: outcomes[bestBalancedIdx].scenario_name,
    objective: 'balance',
    score: bestScore,
    trade_offs: ['Balanced profit vs risk', 'Suitable for steady transformation'],
    risks: ['May not maximize either dimension'],
  });

  return {
    outcomes,
    best_by_profit,
    best_by_risk,
    best_balanced: bestBalancedIdx,
    recommendations,
  };
}
