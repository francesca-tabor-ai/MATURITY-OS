-- Module 5.1: Live Maturity Monitoring™ – data access

-- 1. Latest maturity snapshot for an organisation
-- SELECT id, organisation_id, snapshot_at, data_maturity_index, ai_maturity_score, metrics, source
-- FROM maturity_snapshots
-- WHERE organisation_id = $1
-- ORDER BY snapshot_at DESC
-- LIMIT 1;

-- 2. Historical maturity trend within time window
-- SELECT id, snapshot_at, data_maturity_index, ai_maturity_score, metrics
-- FROM maturity_snapshots
-- WHERE organisation_id = $1 AND snapshot_at >= $2 AND snapshot_at <= $3
-- ORDER BY snapshot_at ASC;

-- 3. Last N snapshots for an organisation
-- SELECT id, snapshot_at, data_maturity_index, ai_maturity_score
-- FROM maturity_snapshots
-- WHERE organisation_id = $1
-- ORDER BY snapshot_at DESC
-- LIMIT $2;

-- 4. Detected anomalies for an organisation in time window
-- SELECT id, snapshot_at, anomaly_type, severity, score_type, details
-- FROM maturity_anomalies
-- WHERE organisation_id = $1 AND snapshot_at >= $2
-- ORDER BY snapshot_at DESC;
