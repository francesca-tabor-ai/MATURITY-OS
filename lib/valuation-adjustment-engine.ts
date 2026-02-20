/**
 * Module 4.1: Company Valuation Adjustment Engine™
 * Projects potential valuation and upside from data/AI maturity using a
 * maturity-adjusted multiples-style model.
 */

import type { ValuationInputs, ValuationOutput, ValuationSensitivityPoint } from './valuation-adjustment-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Maturity-adjusted valuation model:
 * - Average maturity (data + AI)/2 as share of "full" (100) drives an uplift factor.
 * - Assumption: markets value data/AI capability; higher maturity implies higher multiple.
 * - potential = current * (1 + uplift). Uplift is 0 when maturity is at "neutral" (e.g. 50),
 *   positive when above, and scaled by a factor (e.g. 0.5% per point above 50, capped).
 */
export function calculate_valuation_adjustment(inputs: ValuationInputs): ValuationOutput {
  const current = Math.max(0, inputs.current_valuation);
  const data = clamp(inputs.data_maturity_index, 0, 100);
  const ai = clamp(inputs.ai_maturity_score, 0, 100);
  const avgMaturity = (data + ai) / 2;
  const mult = inputs.industry_multiplier ?? 1;

  // Uplift: maturity above 50 adds to implied value; each point above 50 adds ~0.8% to valuation, capped at 40% uplift
  const maturityPremium = (avgMaturity - 50) / 50;
  const upliftPct = clamp(maturityPremium * 0.4 * mult, -0.2, 0.4);
  const potential = current * (1 + upliftPct);
  const upside = potential - current;
  const upsidePct = current > 0 ? (upside / current) * 100 : 0;

  return {
    current_valuation: Math.round(current * 100) / 100,
    potential_valuation: Math.round(potential * 100) / 100,
    valuation_upside: Math.round(upside * 100) / 100,
    valuation_upside_pct: Math.round(upsidePct * 100) / 100,
    data_maturity_index: data,
    ai_maturity_score: ai,
    model_explanation:
      'Maturity-adjusted valuation: potential = current × (1 + uplift). Uplift is driven by average data/AI maturity vs 50; industry multiplier scales the effect. Assumes markets value data and AI capability.',
  };
}

/**
 * Sensitivity analysis: vary data and AI maturity in steps and return potential valuation for each.
 * Suitable for plotting sensitivity curves.
 */
export function run_valuation_sensitivity_analysis(
  baseInputs: ValuationInputs,
  options?: {
    data_steps?: number[];  // e.g. [30, 50, 70, 90]
    ai_steps?: number[];
  }
): ValuationSensitivityPoint[] {
  const dataSteps = options?.data_steps ?? [20, 40, 60, 80, 100];
  const aiSteps = options?.ai_steps ?? [20, 40, 60, 80, 100];
  const points: ValuationSensitivityPoint[] = [];

  for (const data of dataSteps) {
    for (const ai of aiSteps) {
      const out = calculate_valuation_adjustment({
        ...baseInputs,
        data_maturity_index: data,
        ai_maturity_score: ai,
      });
      points.push({
        data_maturity: data,
        ai_maturity: ai,
        potential_valuation: out.potential_valuation,
        valuation_upside: out.valuation_upside,
        valuation_upside_pct: out.valuation_upside_pct,
      });
    }
  }

  return points;
}
