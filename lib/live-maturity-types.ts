/**
 * Module 5.1: Live Maturity Monitoring™ – types
 */

export interface MaturitySnapshot {
  id: string;
  organisation_id: string;
  snapshot_at: string;
  data_maturity_index: number;
  ai_maturity_score: number;
  metrics: Record<string, unknown>;
  source?: string;
}

/** Partial update for incremental score adjustment */
export interface MaturityPartialUpdate {
  data_maturity_delta?: number;
  ai_maturity_delta?: number;
  data_maturity_index?: number;
  ai_maturity_score?: number;
  metrics?: Record<string, unknown>;
}

export interface MaturityAnomaly {
  id: string;
  organisation_id: string;
  snapshot_at: string;
  anomaly_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  score_type: 'data' | 'ai';
  details: Record<string, unknown>;
}

export interface LiveMaturityState {
  latest: MaturitySnapshot | null;
  history: MaturitySnapshot[];
  anomalies: MaturityAnomaly[];
}
