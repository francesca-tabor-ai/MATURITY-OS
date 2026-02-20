/**
 * Module 1.1: Financial Impact Engine™
 * Revenue upside, profit margin expansion, and cost reduction from data/AI maturity.
 * Rule-based model: maturity gap vs. maximum (100) drives potential; industry benchmarks scale.
 */

import type { FinancialImpactInputs, FinancialImpactOutput, IndustryBenchmark } from './financial-impact-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Maturity gap: average shortfall from 100 (max). Higher gap => more upside potential. */
function maturityGap(dataScore: number, aiScore: number): number {
  const d = clamp(dataScore, 0, 100);
  const a = clamp(aiScore, 0, 100);
  return (100 - d + (100 - a)) / 2 / 100;
}

/**
 * Revenue upside: rule-based. Assumption: moving from current maturity to "mature" can unlock
 * a percentage of revenue (e.g. 2–12% depending on gap). Industry multiplier applied.
 */
export function calculateRevenueUpside(
  currentRevenue: number,
  dataMaturityScore: number,
  aiMaturityScore: number,
  industryBenchmark?: IndustryBenchmark
): number {
  const gap = maturityGap(dataMaturityScore, aiMaturityScore);
  const basePct = 0.02 + gap * 0.10;
  const mult = industryBenchmark?.revenue_upside_multiplier ?? 1;
  const upside = currentRevenue * basePct * mult;
  return Math.round(upside * 100) / 100;
}

/**
 * Profit margin expansion: operational efficiency and reduced waste from better data/AI.
 * Returns percentage point improvement (e.g. 1.5 = 1.5 pp) and optional monetary value.
 */
export function calculateProfitMarginExpansion(
  currentMarginPct: number,
  dataMaturityScore: number,
  aiMaturityScore: number,
  revenue: number,
  industryBenchmark?: IndustryBenchmark
): { expansionPct: number; expansionValue: number } {
  const gap = maturityGap(dataMaturityScore, aiMaturityScore);
  const basePp = 0.5 + gap * 3;
  const mult = industryBenchmark?.margin_expansion_multiplier ?? 1;
  const expansionPct = Math.min(10, (basePp * mult));
  const newMargin = clamp(currentMarginPct + expansionPct, 0, 100);
  const expansionValue = revenue * ((newMargin - currentMarginPct) / 100);
  return {
    expansionPct: Math.round(expansionPct * 100) / 100,
    expansionValue: Math.round(expansionValue * 100) / 100,
  };
}

/**
 * Cost reduction: automation, resource optimization, predictive maintenance.
 * Uses headcount and/or operational cost; per-FTE potential scales with maturity gap.
 */
export function calculateCostReduction(
  headcount: number,
  dataMaturityScore: number,
  aiMaturityScore: number,
  operationalCost?: number,
  industryBenchmark?: IndustryBenchmark
): number {
  const gap = maturityGap(dataMaturityScore, aiMaturityScore);
  const costBase = operationalCost ?? headcount * 80000;
  const basePct = 0.03 + gap * 0.12;
  const mult = industryBenchmark?.cost_reduction_multiplier ?? 1;
  const reduction = costBase * basePct * mult;
  return Math.round(reduction * 100) / 100;
}

export class FinancialImpactEngine {
  private inputs: FinancialImpactInputs;

  constructor(inputs: FinancialImpactInputs) {
    this.inputs = inputs;
  }

  setInputs(inputs: FinancialImpactInputs): void {
    this.inputs = inputs;
  }

  calculate(): FinancialImpactOutput {
    const { revenue, profit_margin_pct, headcount, operational_cost, data_maturity_score, ai_maturity_score, industry_benchmark } = this.inputs;

    const revenueUpside = calculateRevenueUpside(revenue, data_maturity_score, ai_maturity_score, industry_benchmark);
    const { expansionPct, expansionValue } = calculateProfitMarginExpansion(
      profit_margin_pct,
      data_maturity_score,
      ai_maturity_score,
      revenue,
      industry_benchmark
    );
    const costReduction = calculateCostReduction(
      headcount,
      data_maturity_score,
      ai_maturity_score,
      operational_cost,
      industry_benchmark
    );

    const revenueUpsidePct = revenue > 0 ? (revenueUpside / revenue) * 100 : 0;

    return {
      revenue_upside: revenueUpside,
      profit_margin_expansion_pct: expansionPct,
      profit_margin_expansion_value: expansionValue,
      cost_reduction: costReduction,
      details: {
        revenue_upside_pct: Math.round(revenueUpsidePct * 100) / 100,
      },
    };
  }

  /** Sensitivity: how revenue_upside changes when data or AI score changes by delta */
  sensitivityRevenueUpside(deltaData: number, deltaAi: number): number {
    const d = clamp(this.inputs.data_maturity_score + deltaData, 0, 100);
    const a = clamp(this.inputs.ai_maturity_score + deltaAi, 0, 100);
    return calculateRevenueUpside(
      this.inputs.revenue,
      d,
      a,
      this.inputs.industry_benchmark
    );
  }

  toJSON(): FinancialImpactOutput {
    return this.calculate();
  }
}

export function runFinancialImpact(inputs: FinancialImpactInputs): FinancialImpactOutput {
  const engine = new FinancialImpactEngine(inputs);
  return engine.calculate();
}
