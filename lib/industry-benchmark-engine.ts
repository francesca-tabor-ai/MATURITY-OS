/**
 * Module 3.1: Industry Benchmark Engine™
 * Retrieves industry benchmarks and compares organisation maturity scores to peers.
 */

import { queryOne, query } from '@/lib/db';
import type {
  MaturityType,
  ComparisonResult,
  IndustryBenchmarkRow,
  ComparisonMetric,
  IndustryBenchmarkReport,
} from './industry-benchmark-types';

/** Default benchmarks when DB has no rows: industry key -> { data_avg, ai_avg } */
const DEFAULT_BENCHMARKS: Record<string, { data_avg: number; ai_avg: number }> = {
  default: { data_avg: 45, ai_avg: 40 },
  technology: { data_avg: 58, ai_avg: 62 },
  'financial services': { data_avg: 52, ai_avg: 48 },
  finance: { data_avg: 52, ai_avg: 48 },
  healthcare: { data_avg: 44, ai_avg: 42 },
  retail: { data_avg: 48, ai_avg: 45 },
  manufacturing: { data_avg: 42, ai_avg: 38 },
};

function normaliseIndustry(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return 'default';
  const k = name.trim().toLowerCase();
  if (DEFAULT_BENCHMARKS[k]) return k;
  if (k.includes('financial') || k.includes('finance')) return 'finance';
  if (k.includes('tech')) return 'technology';
  if (k.includes('health')) return 'healthcare';
  if (k.includes('retail')) return 'retail';
  if (k.includes('manufactur')) return 'manufacturing';
  return 'default';
}

const TOLERANCE = 3; // points within average => "At average"

/**
 * Retrieve industry benchmarks for a maturity type. Tries DB first, then built-in defaults.
 */
export async function get_industry_benchmarks(
  industryClassification: string,
  maturityType: MaturityType
): Promise<IndustryBenchmarkRow | null> {
  const industry = normaliseIndustry(industryClassification);
  const row = await queryOne<{ industry_name: string; maturity_type: string; average_score: number; score_distribution: unknown }>(
    `SELECT industry_name, maturity_type, average_score, score_distribution
     FROM industry_benchmarks
     WHERE LOWER(TRIM(industry_name)) = $1 AND maturity_type = $2`,
    [industry, maturityType]
  );
  if (row) {
    return {
      industry_name: row.industry_name,
      maturity_type: maturityType,
      average_score: Number(row.average_score),
      score_distribution: row.score_distribution as IndustryBenchmarkRow['score_distribution'],
    };
  }
  const def = DEFAULT_BENCHMARKS[industry];
  const avg = def ? (maturityType === 'Data' ? def.data_avg : def.ai_avg) : DEFAULT_BENCHMARKS.default.data_avg;
  return {
    industry_name: industryClassification || industry,
    maturity_type: maturityType,
    average_score: maturityType === 'Data' ? (def?.data_avg ?? 45) : (def?.ai_avg ?? 40),
    score_distribution: {},
  };
}

/**
 * Compare organisation score to industry average; return comparison and percentage difference.
 */
export function compare_to_benchmarks(
  organisationDataScore: number,
  organisationAIScore: number,
  dataBenchmark: { average_score: number },
  aiBenchmark: { average_score: number }
): { data: ComparisonMetric; ai: ComparisonMetric } {
  function toComparison(score: number, avg: number): { comparison: ComparisonResult; pct_diff: number } {
    const diff = score - avg;
    const pct_diff = avg !== 0 ? (diff / avg) * 100 : (diff > 0 ? 100 : diff < 0 ? -100 : 0);
    let comparison: ComparisonResult = 'At average';
    if (diff > TOLERANCE) comparison = 'Above average';
    else if (diff < -TOLERANCE) comparison = 'Below average';
    return { comparison, pct_diff: Math.round(pct_diff * 100) / 100 };
  }

  const dataComp = toComparison(organisationDataScore, dataBenchmark.average_score);
  const aiComp = toComparison(organisationAIScore, aiBenchmark.average_score);

  return {
    data: {
      organisation_score: organisationDataScore,
      industry_average: dataBenchmark.average_score,
      comparison: dataComp.comparison,
      pct_diff: dataComp.pct_diff,
    },
    ai: {
      organisation_score: organisationAIScore,
      industry_average: aiBenchmark.average_score,
      comparison: aiComp.comparison,
      pct_diff: aiComp.pct_diff,
    },
  };
}

/**
 * Build strengths/weaknesses from comparison result.
 */
function buildInsights(data: ComparisonMetric, ai: ComparisonMetric): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (data.comparison === 'Above average') strengths.push(`Data maturity is above industry average (+${data.pct_diff.toFixed(1)}%).`);
  else if (data.comparison === 'Below average') weaknesses.push(`Data maturity is below industry average (${data.pct_diff.toFixed(1)}%).`);
  if (ai.comparison === 'Above average') strengths.push(`AI maturity is above industry average (+${ai.pct_diff.toFixed(1)}%).`);
  else if (ai.comparison === 'Below average') weaknesses.push(`AI maturity is below industry average (${ai.pct_diff.toFixed(1)}%).`);
  return { strengths, weaknesses };
}

/**
 * Industry Benchmark Engine: fetch org maturity, get benchmarks, compare, and generate report.
 */
export class IndustryBenchmarkEngine {
  constructor(
    private organisationId: string,
    private organisationIndustry: string | null
  ) {}

  async run(): Promise<IndustryBenchmarkReport> {
    const industry = normaliseIndustry(this.organisationIndustry);
    const industryLabel = this.organisationIndustry?.trim() || industry;

    const [dataMaturityRow, aiMaturityRow, dataBench, aiBench] = await Promise.all([
      queryOne<{ maturity_index: number }>(
        'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [this.organisationId]
      ),
      queryOne<{ maturity_score: number }>(
        'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [this.organisationId]
      ),
      get_industry_benchmarks(industryLabel, 'Data'),
      get_industry_benchmarks(industryLabel, 'AI'),
    ]);

    const dataScore = dataMaturityRow?.maturity_index != null ? Number(dataMaturityRow.maturity_index) : 0;
    const aiScore = aiMaturityRow?.maturity_score != null ? Number(aiMaturityRow.maturity_score) : 0;

    const dataBenchmark = dataBench ?? { industry_name: industryLabel, maturity_type: 'Data' as const, average_score: 45 };
    const aiBenchmark = aiBench ?? { industry_name: industryLabel, maturity_type: 'AI' as const, average_score: 40 };

    const { data, ai } = compare_to_benchmarks(dataScore, aiScore, dataBenchmark, aiBenchmark);
    const { strengths, weaknesses } = buildInsights(data, ai);

    const report: IndustryBenchmarkReport = {
      organisation_id: this.organisationId,
      industry_used: industryLabel,
      data,
      ai,
      strengths,
      weaknesses,
      generated_at: new Date().toISOString(),
    };

    return report;
  }
}
