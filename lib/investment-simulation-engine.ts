/**
 * Module 6.1: AI Investment Simulation Engine™
 * Simulates maturity and financial impact of AI/data investment with diminishing returns and delay.
 */

import type {
  InvestmentScenarioInput,
  SimulationResult,
  ScenarioComparisonItem,
  ComparisonResult,
} from './investment-simulation-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** £ per point of maturity improvement (baseline; diminishing returns applied on top) */
const DATA_EFFICIENCY = 18000;
const AI_EFFICIENCY = 25000;

/**
 * Diminishing returns: first £ has full effect, each additional £ has slightly less.
 * effective_fraction = 1 - 0.3 * (1 - exp(-investment / scale))
 * So at low investment we get ~100%, at very high we cap at ~70% effective.
 */
function diminishingFactor(investment: number, scale: number): number {
  if (scale <= 0) return 1;
  const x = investment / scale;
  return 1 - 0.35 * (1 - Math.exp(-x));
}

/**
 * Simulate impact of an investment: maturity improvement and projected financial impact.
 * Uses current maturity from context (passed in); models delay (ramp over time_horizon).
 */
export function simulate_investment_impact(
  input: InvestmentScenarioInput,
  currentDataMaturity: number,
  currentAiMaturity: number,
  options?: { revenueForProjection?: number; marginPct?: number }
): SimulationResult {
  const investment = Math.max(0, input.investment_amount);
  const horizon = Math.max(0.5, Math.min(10, input.time_horizon_years));
  const revenue = options?.revenueForProjection ?? input.current_revenue ?? 10_000_000;
  const marginPct = options?.marginPct ?? input.current_margin_pct ?? 10;

  const scaleData = 500_000;
  const scaleAi = 700_000;
  const dimData = diminishingFactor(investment, scaleData);
  const dimAi = diminishingFactor(investment, scaleAi);

  let dataImprovement = 0;
  let aiImprovement = 0;

  if (input.target_area === 'data') {
    const rawPoints = investment / DATA_EFFICIENCY;
    dataImprovement = Math.min(100 - currentDataMaturity, rawPoints * dimData);
  } else if (input.target_area === 'ai') {
    const rawPoints = investment / AI_EFFICIENCY;
    aiImprovement = Math.min(100 - currentAiMaturity, rawPoints * dimAi);
  } else {
    const half = investment / 2;
    dataImprovement = Math.min(100 - currentDataMaturity, (half / DATA_EFFICIENCY) * dimData);
    aiImprovement = Math.min(100 - currentAiMaturity, (half / AI_EFFICIENCY) * dimAi);
  }

  const projectedData = clamp(currentDataMaturity + dataImprovement, 0, 100);
  const projectedAi = clamp(currentAiMaturity + aiImprovement, 0, 100);

  const avgCurrent = (currentDataMaturity + currentAiMaturity) / 2;
  const avgProjected = (projectedData + projectedAi) / 2;
  const maturityGain = Math.max(0, avgProjected - avgCurrent);

  const revenueUpsidePct = 0.02 + (maturityGain / 100) * 0.12;
  const projectedRevenueIncrease = revenue * revenueUpsidePct;
  const marginExpansionPct = Math.min(5, maturityGain * 0.08);
  const profitFromMargin = revenue * (marginExpansionPct / 100);
  const projectedProfitIncrease = projectedRevenueIncrease * 0.4 + profitFromMargin + revenue * 0.01 * (maturityGain / 20);

  const delayYears = Math.min(horizon * 0.4, 2);
  const effectiveTimeToBenefit = delayYears + horizon * 0.5;
  const annualisedBenefit = horizon > 0 ? projectedProfitIncrease / horizon : 0;
  const returnPerUnit = investment > 0 ? projectedProfitIncrease / investment : 0;

  return {
    scenario_index: 0,
    investment_amount: Math.round(investment * 100) / 100,
    target_area: input.target_area,
    time_horizon_years: horizon,
    simulated_data_maturity_improvement: Math.round(dataImprovement * 100) / 100,
    simulated_ai_maturity_improvement: Math.round(aiImprovement * 100) / 100,
    projected_data_maturity: Math.round(projectedData * 100) / 100,
    projected_ai_maturity: Math.round(projectedAi * 100) / 100,
    projected_profit_increase: Math.round(projectedProfitIncrease * 100) / 100,
    projected_revenue_increase: Math.round(projectedRevenueIncrease * 100) / 100,
    effective_time_to_benefit_years: Math.round(effectiveTimeToBenefit * 100) / 100,
    annualised_benefit_year_end: Math.round(annualisedBenefit * 100) / 100,
    return_per_unit: Math.round(returnPerUnit * 100) / 100,
  };
}

/**
 * Compare multiple simulation results; rank by impact and cost-effectiveness; add risk indicator.
 */
export function compare_investment_scenarios(results: SimulationResult[]): ComparisonResult {
  const withIndex = results.map((r, i) => ({ ...r, scenario_index: i }));

  const byProfit = [...withIndex].sort((a, b) => b.projected_profit_increase - a.projected_profit_increase);
  const byROI = [...withIndex].sort((a, b) => b.return_per_unit - a.return_per_unit);

  const rankByImpact = new Map<number, number>();
  byProfit.forEach((s, rank) => rankByImpact.set(s.scenario_index, rank + 1));
  const rankByCostEff = new Map<number, number>();
  byROI.forEach((s, rank) => rankByCostEff.set(s.scenario_index, rank + 1));

  const scenarios: ScenarioComparisonItem[] = withIndex.map((r) => {
    const timeRisk = r.effective_time_to_benefit_years > 3 ? 1 : r.effective_time_to_benefit_years > 1.5 ? 0.5 : 0;
    const roiRisk = r.return_per_unit < 0.5 ? 1 : r.return_per_unit < 1 ? 0.5 : 0;
    const riskScore = timeRisk + roiRisk;
    const risk_indicator: 'low' | 'medium' | 'high' = riskScore >= 1.5 ? 'high' : riskScore >= 0.5 ? 'medium' : 'low';

    return {
      scenario_index: r.scenario_index,
      investment_amount: r.investment_amount,
      target_area: r.target_area,
      projected_profit_increase: r.projected_profit_increase,
      return_per_unit: r.return_per_unit,
      effective_time_to_benefit_years: r.effective_time_to_benefit_years,
      rank_by_impact: rankByImpact.get(r.scenario_index) ?? 0,
      rank_by_cost_effectiveness: rankByCostEff.get(r.scenario_index) ?? 0,
      risk_indicator,
    };
  });

  return {
    scenarios,
    best_by_impact: byProfit[0]?.scenario_index ?? 0,
    best_by_cost_effectiveness: byROI[0]?.scenario_index ?? 0,
  };
}
