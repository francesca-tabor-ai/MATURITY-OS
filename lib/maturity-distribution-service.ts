/**
 * Module 3.2: Maturity Distribution Visualisation™
 * Aggregates maturity scores for a set of organisations and computes distribution statistics.
 */

import { query } from '@/lib/db';
import type { AggregatedMaturityData, DistributionStats, MaturityDistributionAnalysis } from './maturity-distribution-types';

/**
 * Retrieve latest data and AI maturity scores for the given organisation IDs.
 * Returns aggregated lists suitable for distribution analysis.
 */
export async function aggregate_maturity_data(
  organisationIds: string[],
  industryFilter: string | null
): Promise<AggregatedMaturityData> {
  if (organisationIds.length === 0) {
    return { data_scores: [], ai_scores: [], organisation_ids: [], industry_filter: industryFilter };
  }

  const [dataRows, aiRows] = await Promise.all([
    query<{ organisation_id: string; score: number }>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, maturity_index AS score
        FROM data_maturity_results
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, score FROM latest`,
      [organisationIds]
    ),
    query<{ organisation_id: string; score: number }>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, maturity_score AS score
        FROM ai_maturity_results
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, score FROM latest`,
      [organisationIds]
    ),
  ]);

  const data_scores = dataRows.map((r) => Number(r.score));
  const ai_scores = aiRows.map((r) => Number(r.score));

  return {
    data_scores,
    ai_scores,
    organisation_ids: organisationIds,
    industry_filter: industryFilter,
  };
}

function sortedCopy(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

function percentileSorted(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = p * (sorted.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (i - lo) * (sorted[hi] - sorted[lo]);
}

/**
 * Calculate mean, median, std dev, quartiles, and optional outliers for a list of scores.
 */
export function analyze_maturity_distribution(scores: number[]): DistributionStats {
  const sorted = sortedCopy(scores);
  const n = sorted.length;

  if (n === 0) {
    return {
      mean: 0,
      median: 0,
      std_dev: 0,
      q1: 0,
      q3: 0,
      min: 0,
      max: 0,
      count: 0,
      outliers: [],
    };
  }

  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const variance = sorted.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
  const std_dev = Math.sqrt(variance);
  const median = percentileSorted(sorted, 0.5);
  const q1 = percentileSorted(sorted, 0.25);
  const q3 = percentileSorted(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter((x) => x < lowerFence || x > upperFence);

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    std_dev: Math.round(std_dev * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    min: sorted[0],
    max: sorted[n - 1],
    count: n,
    outliers: outliers.length > 0 ? outliers : undefined,
  };
}

/**
 * Full pipeline: aggregate scores for orgs then analyze distribution for data and AI.
 */
export function runDistributionAnalysis(aggregated: AggregatedMaturityData): MaturityDistributionAnalysis {
  return {
    data: analyze_maturity_distribution(aggregated.data_scores),
    ai: analyze_maturity_distribution(aggregated.ai_scores),
  };
}
