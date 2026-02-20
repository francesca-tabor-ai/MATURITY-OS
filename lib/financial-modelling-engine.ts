/**
 * Platform Infrastructure — Financial Modelling Engine
 * RevenueImpactService, CostImpactService, ProfitImpactService, FinancialModelOrchestrator.
 */

import { calculateRevenueUpside, calculateCostReduction } from './financial-impact-engine';
import type { IndustryBenchmark } from './financial-impact-types';
import type {
  RevenueImpactInputs,
  RevenueImpactOutput,
  CostImpactInputs,
  CostImpactOutput,
  CostReductionAreas,
  ProfitImpactInputs,
  ProfitImpactOutput,
  FinancialModelInputs,
  FinancialImpactReport,
} from './financial-modelling-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Revenue impact: projected revenue increase and total potential revenue (supports maturity-gap and growth-rate models). */
export class RevenueImpactService {
  calculate(inputs: RevenueImpactInputs): RevenueImpactOutput {
    const revenue = Math.max(0, inputs.current_revenue);
    const dataM = clamp(inputs.data_maturity_index, 0, 100);
    const aiM = clamp(inputs.ai_maturity_score, 0, 100);
    const growthPct = inputs.industry_growth_rate_pct ?? 0;

    let projectedIncrease: number;
    let modelUsed: 'maturity_gap' | 'growth_rate' = 'maturity_gap';

    if (growthPct > 0 && growthPct < 50) {
      const maturityFactor = (dataM + aiM) / 200;
      const effectiveGrowth = growthPct * (0.5 + maturityFactor * 0.5) / 100;
      projectedIncrease = revenue * effectiveGrowth;
      modelUsed = 'growth_rate';
    } else {
      projectedIncrease = calculateRevenueUpside(
        revenue,
        dataM,
        aiM,
        inputs.industry_benchmark
      );
    }

    const totalPotential = revenue + projectedIncrease;
    const increasePct = revenue > 0 ? (projectedIncrease / revenue) * 100 : 0;

    return {
      projected_revenue_increase: Math.round(projectedIncrease * 100) / 100,
      total_potential_revenue: Math.round(totalPotential * 100) / 100,
      revenue_increase_pct: Math.round(increasePct * 100) / 100,
      model_used: modelUsed,
    };
  }
}

/** Cost impact: estimated cost savings and areas of reduction. */
export class CostImpactService {
  calculate(inputs: CostImpactInputs): CostImpactOutput {
    const headcount = Math.max(0, inputs.headcount);
    const dataM = clamp(inputs.data_maturity_index, 0, 100);
    const aiM = clamp(inputs.ai_maturity_score, 0, 100);
    const costBase = inputs.operational_cost ?? headcount * 80_000;

    const totalSavings = calculateCostReduction(
      headcount,
      dataM,
      aiM,
      inputs.operational_cost,
      inputs.industry_benchmark
    );

    const gap = (100 - dataM + (100 - aiM)) / 200 / 100;
    const automation = totalSavings * (0.35 + gap * 0.2);
    const processEfficiency = totalSavings * (0.30 + gap * 0.15);
    const resourceOptimization = totalSavings * (0.25 + gap * 0.15);
    const other = Math.max(0, totalSavings - automation - processEfficiency - resourceOptimization);

    const areas: CostReductionAreas = {
      automation: Math.round(automation * 100) / 100,
      process_efficiency: Math.round(processEfficiency * 100) / 100,
      resource_optimization: Math.round(resourceOptimization * 100) / 100,
      other: Math.round(other * 100) / 100,
    };

    const savingsPct = costBase > 0 ? (totalSavings / costBase) * 100 : 0;

    return {
      estimated_cost_savings: Math.round(totalSavings * 100) / 100,
      areas_of_reduction: areas,
      savings_as_pct_of_cost: Math.round(savingsPct * 100) / 100,
    };
  }
}

/** Profit impact: combines revenue and cost impacts; applies optional tax. */
export class ProfitImpactService {
  calculate(inputs: ProfitImpactInputs): ProfitImpactOutput {
    const revenueIncrease = inputs.revenue_impact.projected_revenue_increase;
    const costSavings = inputs.cost_impact.estimated_cost_savings;
    const currentProfit = Math.max(0, inputs.current_profit);
    const taxRate = clamp(inputs.tax_rate_pct ?? 0, 0, 100) / 100;

    const netProfitIncrease = revenueIncrease + costSavings;
    const taxAdjusted = netProfitIncrease * (1 - taxRate);
    const impactPct = currentProfit > 0 ? (netProfitIncrease / currentProfit) * 100 : 0;

    return {
      net_profit_increase: Math.round(netProfitIncrease * 100) / 100,
      tax_adjusted_net_increase: Math.round(taxAdjusted * 100) / 100,
      total_profit_impact_pct: Math.round(impactPct * 100) / 100,
    };
  }
}

/** Orchestrator: runs revenue, cost, and profit services; aggregates into one report; handles errors. */
export class FinancialModelOrchestrator {
  private revenueService = new RevenueImpactService();
  private costService = new CostImpactService();
  private profitService = new ProfitImpactService();

  run(inputs: FinancialModelInputs): FinancialImpactReport {
    const errors: string[] = [];
    const computedAt = new Date().toISOString();

    let revenueImpact: RevenueImpactOutput | null = null;
    let costImpact: CostImpactOutput | null = null;
    let profitImpact: ProfitImpactOutput | null = null;

    try {
      revenueImpact = this.revenueService.calculate({
        current_revenue: inputs.current_revenue,
        data_maturity_index: inputs.data_maturity_index,
        ai_maturity_score: inputs.ai_maturity_score,
        industry_growth_rate_pct: inputs.industry_growth_rate_pct,
        industry_benchmark: inputs.industry_benchmark,
      });
    } catch (e) {
      errors.push(`RevenueImpact: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    try {
      costImpact = this.costService.calculate({
        operational_cost: inputs.operational_cost,
        headcount: inputs.headcount,
        data_maturity_index: inputs.data_maturity_index,
        ai_maturity_score: inputs.ai_maturity_score,
        industry_benchmark: inputs.industry_benchmark,
      });
    } catch (e) {
      errors.push(`CostImpact: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    const currentProfit = inputs.current_revenue * (clamp(inputs.profit_margin_pct, 0, 100) / 100);
    if (revenueImpact && costImpact) {
      try {
        profitImpact = this.profitService.calculate({
          revenue_impact: revenueImpact,
          cost_impact: costImpact,
          current_profit: currentProfit,
          tax_rate_pct: inputs.tax_rate_pct,
        });
      } catch (e) {
        errors.push(`ProfitImpact: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    const rev = revenueImpact ?? {
      projected_revenue_increase: 0,
      total_potential_revenue: inputs.current_revenue,
      revenue_increase_pct: 0,
      model_used: 'maturity_gap' as const,
    };
    const cost = costImpact ?? {
      estimated_cost_savings: 0,
      areas_of_reduction: { automation: 0, process_efficiency: 0, resource_optimization: 0, other: 0 },
      savings_as_pct_of_cost: 0,
    };
    const profit = profitImpact ?? {
      net_profit_increase: rev.projected_revenue_increase + cost.estimated_cost_savings,
      tax_adjusted_net_increase: 0,
      total_profit_impact_pct: 0,
    };

    return {
      organisation_id: inputs.organisation_id,
      revenue_impact: rev,
      cost_impact: cost,
      profit_impact: profit,
      summary: {
        total_revenue_upside: rev.projected_revenue_increase,
        total_cost_savings: cost.estimated_cost_savings,
        net_profit_increase: profit.net_profit_increase,
        tax_adjusted_profit_increase: profit.tax_adjusted_net_increase,
      },
      computed_at: computedAt,
      ...(errors.length > 0 && { errors }),
    };
  }
}

/** One-shot: run orchestrator and return report */
export function runFinancialModel(inputs: FinancialModelInputs): FinancialImpactReport {
  const orchestrator = new FinancialModelOrchestrator();
  return orchestrator.run(inputs);
}
