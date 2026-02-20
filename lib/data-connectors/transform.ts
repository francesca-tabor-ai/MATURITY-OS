/**
 * Transform raw connector metrics into standard maturity metrics (0–100 indices).
 * Heuristic: data maturity from volume, structure, usage; AI maturity from ML/automation signals.
 */

import type { RawConnectorMetrics, StandardMaturityMetrics } from './types';

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Map raw connector output to data_maturity_index and ai_maturity_score */
export function transformToStandardMetrics(
  raw: RawConnectorMetrics,
  connectorType: string
): StandardMaturityMetrics {
  let dataScore = 30;
  let aiScore = 25;

  const tables = raw.tables_count ?? 0;
  const sizeGb = (raw.total_size_bytes ?? 0) / (1024 ** 3);
  const queryCount = raw.query_count_7d ?? 0;
  const s3Objects = raw.s3_total_objects ?? 0;
  const redshiftTables = raw.redshift_tables ?? 0;
  const glueJobs = raw.glue_jobs_count ?? 0;
  const sagemakerEndpoints = raw.sagemaker_endpoints ?? 0;
  const sfObjects = raw.salesforce_objects_count ?? 0;
  const sfApiCalls = raw.salesforce_api_calls_24h ?? 0;

  if (connectorType === 'snowflake') {
    dataScore = 25 + Math.min(40, tables * 3) + Math.min(20, Math.floor(sizeGb / 5)) + Math.min(15, Math.floor(queryCount / 30));
    aiScore = 20 + Math.min(30, Math.floor(queryCount / 50));
  } else if (connectorType === 'aws') {
    dataScore = 25 + Math.min(35, Math.floor(s3Objects / 2000)) + Math.min(25, (redshiftTables ?? 0) * 2) + Math.min(15, glueJobs * 4);
    aiScore = 20 + Math.min(40, (sagemakerEndpoints ?? 0) * 15) + Math.min(25, glueJobs * 3);
  } else if (connectorType === 'salesforce') {
    dataScore = 30 + Math.min(35, sfObjects * 5) + Math.min(25, Math.floor(sfApiCalls / 500));
    aiScore = 25 + Math.min(20, Math.floor(sfApiCalls / 1000));
  }

  return {
    data_maturity_index: clamp(dataScore),
    ai_maturity_score: clamp(aiScore),
    metrics: raw as Record<string, unknown>,
    source: `connector:${connectorType}`,
  };
}
