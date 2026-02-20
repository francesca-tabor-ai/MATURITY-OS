/**
 * Module 4.3: Acquisition Opportunity Scanner™
 * Identifies undervalued companies and scores acquisition attractiveness.
 */

import { calculate_valuation_adjustment } from './valuation-adjustment-engine';
import type {
  AcquisitionCandidate,
  IndustryBenchmark,
  UndervaluedCompany,
  AcquisitionTarget,
  AcquisitionScannerFilters,
} from './acquisition-scanner-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Identify companies that are potentially undervalued: current valuation is below
 * intrinsic value implied by their data/AI maturity and potential for improvement.
 * Uses the same maturity-adjusted valuation model as Module 4.1.
 */
export function identify_undervalued_companies(
  candidates: AcquisitionCandidate[],
  _industryBenchmarks?: IndustryBenchmark[]
): UndervaluedCompany[] {
  const results: UndervaluedCompany[] = [];

  for (const c of candidates) {
    const current = c.current_valuation ?? 0;
    const data = clamp(c.data_maturity_index ?? 0, 0, 100);
    const ai = clamp(c.ai_maturity_score ?? 0, 0, 100);

    if (current <= 0) continue;

    let potential: number;
    if (c.potential_valuation != null && c.potential_valuation > 0) {
      potential = c.potential_valuation;
    } else {
      const out = calculate_valuation_adjustment({
        current_valuation: current,
        data_maturity_index: data,
        ai_maturity_score: ai,
      });
      potential = out.potential_valuation;
    }

    const upside = potential - current;
    const upsidePct = current > 0 ? (upside / current) * 100 : 0;

    // Undervaluation score 0–100: higher when upside % is larger (more "room" vs intrinsic value)
    const rawScore = Math.min(100, Math.max(0, upsidePct * 2));
    const undervaluation_score = Math.round(rawScore * 100) / 100;

    results.push({
      organisation_id: c.organisation_id,
      name: c.name,
      industry: c.industry,
      current_valuation: current,
      potential_valuation: potential,
      valuation_upside: potential - current,
      valuation_upside_pct: upsidePct,
      data_maturity_index: data,
      ai_maturity_score: ai,
      undervaluation_score,
      rationale: upsidePct > 0 ? `Potential upside ${upsidePct.toFixed(1)}% vs current valuation` : undefined,
    });
  }

  return results.sort((a, b) => b.undervaluation_score - a.undervaluation_score);
}

/**
 * Score acquisition targets by attractiveness: undervaluation, growth potential,
 * risk profile, and estimated cost to improve maturity. Returns a ranked list.
 */
export function score_acquisition_targets(
  undervalued: UndervaluedCompany[],
  candidatesByOrg: Map<string, AcquisitionCandidate>
): AcquisitionTarget[] {
  const targets: AcquisitionTarget[] = [];

  for (const u of undervalued) {
    const c = candidatesByOrg.get(u.organisation_id);

    const undervaluationComponent = clamp(u.undervaluation_score, 0, 100);
    const revenueUpside = c?.revenue_upside ?? 0;
    const maxRevenue = 50e6;
    const growthComponent = Math.min(100, (revenueUpside / maxRevenue) * 100);
    const riskScore = c?.overall_risk_score ?? 50;
    const riskComponent = Math.max(0, 100 - riskScore);
    const investment = c?.total_investment ?? 0;
    const upsidePct = u.valuation_upside_pct || 0;
    const costComponent = investment <= 0 ? 100 : Math.max(0, 100 - (investment / (u.current_valuation || 1)) * 10);

    const w1 = 0.35;
    const w2 = 0.25;
    const w3 = 0.2;
    const w4 = 0.2;
    const acquisition_attractiveness_score = clamp(
      w1 * undervaluationComponent + w2 * growthComponent + w3 * riskComponent + w4 * costComponent,
      0,
      100
    );

    targets.push({
      organisation_id: u.organisation_id,
      name: u.name,
      industry: u.industry,
      undervaluation_score: u.undervaluation_score,
      acquisition_attractiveness_score: Math.round(acquisition_attractiveness_score * 100) / 100,
      current_valuation: u.current_valuation,
      potential_valuation: u.potential_valuation,
      valuation_upside_pct: u.valuation_upside_pct,
      data_maturity_index: u.data_maturity_index,
      ai_maturity_score: u.ai_maturity_score,
      revenue_upside: c?.revenue_upside ?? null,
      risk_level: c?.risk_level ?? null,
      rationale: `Undervaluation ${undervaluationComponent.toFixed(0)}; growth potential ${growthComponent.toFixed(0)}; risk adj ${riskComponent.toFixed(0)}.`,
    });
  }

  return targets.sort((a, b) => b.acquisition_attractiveness_score - a.acquisition_attractiveness_score);
}

/**
 * Apply API filters to a list of candidates (before identification).
 */
export function apply_acquisition_filters(
  candidates: AcquisitionCandidate[],
  filters: AcquisitionScannerFilters
): AcquisitionCandidate[] {
  return candidates.filter((c) => {
    const val = c.current_valuation ?? 0;
    if (filters.min_valuation != null && val < filters.min_valuation) return false;
    if (filters.max_valuation != null && val > filters.max_valuation) return false;
    const data = c.data_maturity_index ?? 0;
    if (filters.min_data_maturity != null && data < filters.min_data_maturity) return false;
    if (filters.max_data_maturity != null && data > filters.max_data_maturity) return false;
    const ai = c.ai_maturity_score ?? 0;
    if (filters.min_ai_maturity != null && ai < filters.min_ai_maturity) return false;
    if (filters.max_ai_maturity != null && ai > filters.max_ai_maturity) return false;
    if (filters.industry != null && filters.industry.trim() !== '') {
      const ind = (c.industry ?? '').trim().toLowerCase();
      if (ind !== filters.industry.trim().toLowerCase()) return false;
    }
    return true;
  });
}
