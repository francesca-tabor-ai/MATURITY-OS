/** Module 3.2: Maturity Distribution Visualisation™ – types */

export type MaturityType = 'Data' | 'AI';

export interface AggregatedMaturityData {
  data_scores: number[];
  ai_scores: number[];
  organisation_ids: string[];
  industry_filter: string | null;
}

export interface DistributionStats {
  mean: number;
  median: number;
  std_dev: number;
  q1: number;
  q3: number;
  min: number;
  max: number;
  count: number;
  /** Outliers (IQR method): values below q1 - 1.5*IQR or above q3 + 1.5*IQR */
  outliers?: number[];
}

export interface MaturityDistributionAnalysis {
  data: DistributionStats;
  ai: DistributionStats;
}

export interface MaturityDistributionResponse {
  aggregated: AggregatedMaturityData;
  analysis: MaturityDistributionAnalysis;
}
