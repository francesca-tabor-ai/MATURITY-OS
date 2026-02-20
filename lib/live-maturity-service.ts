/**
 * Module 5.1: Live Maturity Monitoring™
 * Time-series snapshots, incremental updates, and anomaly detection.
 */

import { query, queryOne } from '@/lib/db';
import type {
  MaturitySnapshot,
  MaturityPartialUpdate,
  MaturityAnomaly,
  LiveMaturityState,
} from './live-maturity-types';

function num(x: unknown): number {
  if (x == null) return 0;
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export async function getMaturityHistory(
  organisationId: string,
  options: { limit?: number; since?: Date } = {}
): Promise<MaturitySnapshot[]> {
  const limit = Math.min(500, options.limit ?? 100);
  const since = options.since?.toISOString();

  const rows = since
    ? await query<{
        id: string;
        organisation_id: string;
        snapshot_at: string;
        data_maturity_index: unknown;
        ai_maturity_score: unknown;
        metrics: unknown;
        source: string | null;
      }>(
        `SELECT id, organisation_id, snapshot_at, data_maturity_index, ai_maturity_score, metrics, source
         FROM maturity_snapshots
         WHERE organisation_id = $1 AND snapshot_at >= $2
         ORDER BY snapshot_at ASC
         LIMIT $3`,
        [organisationId, since, limit]
      )
    : await query<{
        id: string;
        organisation_id: string;
        snapshot_at: string;
        data_maturity_index: unknown;
        ai_maturity_score: unknown;
        metrics: unknown;
        source: string | null;
      }>(
        `SELECT id, organisation_id, snapshot_at, data_maturity_index, ai_maturity_score, metrics, source
         FROM maturity_snapshots
         WHERE organisation_id = $1
         ORDER BY snapshot_at DESC
         LIMIT $2`,
        [organisationId, limit]
      );

  const list = rows.map((r) => ({
    id: r.id,
    organisation_id: r.organisation_id,
    snapshot_at: r.snapshot_at,
    data_maturity_index: num(r.data_maturity_index),
    ai_maturity_score: num(r.ai_maturity_score),
    metrics: (typeof r.metrics === 'object' && r.metrics !== null ? r.metrics : {}) as Record<string, unknown>,
    source: r.source ?? undefined,
  }));

  if (since) return list;
  return list.reverse();
}

export async function getLatestSnapshot(organisationId: string): Promise<MaturitySnapshot | null> {
  const row = await queryOne<{
    id: string;
    organisation_id: string;
    snapshot_at: string;
    data_maturity_index: unknown;
    ai_maturity_score: unknown;
    metrics: unknown;
    source: string | null;
  }>(
    `SELECT id, organisation_id, snapshot_at, data_maturity_index, ai_maturity_score, metrics, source
     FROM maturity_snapshots
     WHERE organisation_id = $1
     ORDER BY snapshot_at DESC
     LIMIT 1`,
    [organisationId]
  );
  if (!row) return null;
  return {
    id: row.id,
    organisation_id: row.organisation_id,
    snapshot_at: row.snapshot_at,
    data_maturity_index: num(row.data_maturity_index),
    ai_maturity_score: num(row.ai_maturity_score),
    metrics: (typeof row.metrics === 'object' && row.metrics !== null ? row.metrics : {}) as Record<string, unknown>,
    source: row.source ?? undefined,
  };
}

export async function recordSnapshot(
  organisationId: string,
  data: { data_maturity_index: number; ai_maturity_score: number; metrics?: Record<string, unknown>; source?: string },
  userId?: string | null
): Promise<MaturitySnapshot> {
  const dataIdx = Math.max(0, Math.min(100, data.data_maturity_index));
  const aiScore = Math.max(0, Math.min(100, data.ai_maturity_score));
  const metrics = data.metrics ?? {};
  const source = data.source ?? 'manual';

  const row = await queryOne<{ id: string; snapshot_at: string }>(
    `INSERT INTO maturity_snapshots (organisation_id, data_maturity_index, ai_maturity_score, metrics, source, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, snapshot_at`,
    [organisationId, dataIdx, aiScore, JSON.stringify(metrics), source, userId ?? null]
  );
  if (!row) throw new Error('Failed to insert snapshot');

  return {
    id: row.id,
    organisation_id: organisationId,
    snapshot_at: row.snapshot_at,
    data_maturity_index: dataIdx,
    ai_maturity_score: aiScore,
    metrics,
    source,
  };
}

/**
 * Apply partial updates to the latest snapshot and record a new snapshot.
 * Deltas are added to the last known scores; absolute values override when provided.
 */
export async function update_maturity_scores_incrementally(
  organisationId: string,
  update: MaturityPartialUpdate,
  userId?: string | null
): Promise<MaturitySnapshot> {
  const latest = await getLatestSnapshot(organisationId);
  const prevData = latest?.data_maturity_index ?? 50;
  const prevAi = latest?.ai_maturity_score ?? 50;

  const dataIdx = update.data_maturity_index != null
    ? Math.max(0, Math.min(100, update.data_maturity_index))
    : Math.max(0, Math.min(100, prevData + (update.data_maturity_delta ?? 0)));
  const aiScore = update.ai_maturity_score != null
    ? Math.max(0, Math.min(100, update.ai_maturity_score))
    : Math.max(0, Math.min(100, prevAi + (update.ai_maturity_delta ?? 0)));

  return recordSnapshot(
    organisationId,
    {
      data_maturity_index: dataIdx,
      ai_maturity_score: aiScore,
      metrics: update.metrics ?? (latest?.metrics ?? {}),
      source: 'incremental',
    },
    userId
  );
}

const WINDOW = 5;
const THRESHOLD_STD = 2;

function movingAvg(arr: number[], i: number, window: number): number {
  const start = Math.max(0, i - window + 1);
  const slice = arr.slice(start, i + 1);
  if (slice.length === 0) return arr[i] ?? 0;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function stdDev(arr: number[], i: number, window: number): number {
  const start = Math.max(0, i - window + 1);
  const slice = arr.slice(start, i + 1);
  if (slice.length < 2) return 0;
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((s, x) => s + (x - mean) ** 2, 0) / slice.length;
  return Math.sqrt(variance);
}

export interface DetectedAnomaly {
  snapshot_at: string;
  anomaly_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  score_type: 'data' | 'ai';
  details: Record<string, unknown>;
}

/**
 * Detect anomalies in maturity history using moving average and standard deviation.
 * Flags significant deviations (spikes or drops) from recent trend.
 */
export function detect_maturity_anomalies(history: MaturitySnapshot[]): DetectedAnomaly[] {
  const anomalies: DetectedAnomaly[] = [];
  const dataSeries = history.map((s) => s.data_maturity_index);
  const aiSeries = history.map((s) => s.ai_maturity_score);

  for (let i = WINDOW; i < history.length; i++) {
    const dataVal = dataSeries[i];
    const dataMean = movingAvg(dataSeries, i, WINDOW);
    const dataStd = stdDev(dataSeries, i, WINDOW) || 1;
    const dataZ = Math.abs((dataVal - dataMean) / dataStd);
    if (dataZ >= THRESHOLD_STD) {
      const severity: 'LOW' | 'MEDIUM' | 'HIGH' = dataZ >= 3 ? 'HIGH' : dataZ >= 2.5 ? 'MEDIUM' : 'LOW';
      anomalies.push({
        snapshot_at: history[i].snapshot_at,
        anomaly_type: dataVal > dataMean ? 'SPIKE' : 'DROP',
        severity,
        score_type: 'data',
        details: { value: dataVal, mean: dataMean, std: dataStd, z: dataZ },
      });
    }

    const aiVal = aiSeries[i];
    const aiMean = movingAvg(aiSeries, i, WINDOW);
    const aiStd = stdDev(aiSeries, i, WINDOW) || 1;
    const aiZ = Math.abs((aiVal - aiMean) / aiStd);
    if (aiZ >= THRESHOLD_STD) {
      const severity: 'LOW' | 'MEDIUM' | 'HIGH' = aiZ >= 3 ? 'HIGH' : aiZ >= 2.5 ? 'MEDIUM' : 'LOW';
      anomalies.push({
        snapshot_at: history[i].snapshot_at,
        anomaly_type: aiVal > aiMean ? 'SPIKE' : 'DROP',
        severity,
        score_type: 'ai',
        details: { value: aiVal, mean: aiMean, std: aiStd, z: aiZ },
      });
    }
  }

  return anomalies;
}

export async function getStoredAnomalies(
  organisationId: string,
  since?: Date
): Promise<MaturityAnomaly[]> {
  const sinceStr = since?.toISOString();
  const rows = sinceStr
    ? await query<{
        id: string;
        organisation_id: string;
        snapshot_at: string;
        anomaly_type: string;
        severity: string;
        score_type: string;
        details: unknown;
      }>(
        `SELECT id, organisation_id, snapshot_at, anomaly_type, severity, score_type, details
         FROM maturity_anomalies
         WHERE organisation_id = $1 AND snapshot_at >= $2
         ORDER BY snapshot_at DESC`,
        [organisationId, sinceStr]
      )
    : await query<{
        id: string;
        organisation_id: string;
        snapshot_at: string;
        anomaly_type: string;
        severity: string;
        score_type: string;
        details: unknown;
      }>(
        `SELECT id, organisation_id, snapshot_at, anomaly_type, severity, score_type, details
         FROM maturity_anomalies
         WHERE organisation_id = $1
         ORDER BY snapshot_at DESC
         LIMIT 50`,
        [organisationId]
      );

  return rows.map((r) => ({
    id: r.id,
    organisation_id: r.organisation_id,
    snapshot_at: r.snapshot_at,
    anomaly_type: r.anomaly_type,
    severity: r.severity as 'LOW' | 'MEDIUM' | 'HIGH',
    score_type: r.score_type as 'data' | 'ai',
    details: (typeof r.details === 'object' && r.details !== null ? r.details : {}) as Record<string, unknown>,
  }));
}

export async function storeAnomalies(
  organisationId: string,
  anomalies: DetectedAnomaly[]
): Promise<void> {
  for (const a of anomalies) {
    await query(
      `INSERT INTO maturity_anomalies (organisation_id, snapshot_at, anomaly_type, severity, score_type, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [organisationId, a.snapshot_at, a.anomaly_type, a.severity, a.score_type, JSON.stringify(a.details)]
    );
  }
}

export async function getLiveMaturityState(
  organisationId: string,
  options: { historyLimit?: number; detectAndStoreAnomalies?: boolean } = {}
): Promise<LiveMaturityState> {
  const historyLimit = options.historyLimit ?? 100;
  const history = await getMaturityHistory(organisationId, { limit: historyLimit });
  const latest = history.length > 0 ? history[history.length - 1] : await getLatestSnapshot(organisationId);

  let anomalies = await getStoredAnomalies(organisationId);
  if (history.length >= WINDOW + 1) {
    const detected = detect_maturity_anomalies(history);
    if (options.detectAndStoreAnomalies && detected.length > 0) {
      await storeAnomalies(organisationId, detected);
      anomalies = await getStoredAnomalies(organisationId);
    } else if (!options.detectAndStoreAnomalies && anomalies.length === 0) {
      anomalies = detected.map((a, i) => ({
        id: `detected-${i}`,
        organisation_id: organisationId,
        snapshot_at: a.snapshot_at,
        anomaly_type: a.anomaly_type,
        severity: a.severity,
        score_type: a.score_type,
        details: a.details,
      }));
    }
  }

  return { latest, history, anomalies };
}
