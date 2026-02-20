/** Module 3.1: Industry Benchmark Engine™ – types */

export type MaturityType = 'Data' | 'AI';

export type ComparisonResult = 'Above average' | 'At average' | 'Below average';

export interface BenchmarkDistribution {
  p25?: number;
  p50?: number;
  p75?: number;
  std_dev?: number;
}

export interface IndustryBenchmarkRow {
  industry_name: string;
  maturity_type: MaturityType;
  average_score: number;
  score_distribution?: BenchmarkDistribution;
}

/** Result of comparing one score to industry average */
export interface ComparisonMetric {
  organisation_score: number;
  industry_average: number;
  comparison: ComparisonResult;
  pct_diff: number; // e.g. +10.5 means 10.5% above average
}

export interface IndustryBenchmarkReport {
  organisation_id: string;
  industry_used: string;
  data: ComparisonMetric;
  ai: ComparisonMetric;
  strengths: string[];
  weaknesses: string[];
  generated_at: string; // ISO
}
