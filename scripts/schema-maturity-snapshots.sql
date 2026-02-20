-- Module 5.1: Live Maturity Monitoring™
-- Time-series storage for data and AI maturity scores

CREATE TABLE IF NOT EXISTS maturity_snapshots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id       UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  snapshot_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_maturity_index  NUMERIC(5,2) NOT NULL CHECK (data_maturity_index >= 0 AND data_maturity_index <= 100),
  ai_maturity_score    NUMERIC(5,2) NOT NULL CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
  metrics              JSONB DEFAULT '{}',
  source                VARCHAR(50) DEFAULT 'manual',
  created_by            UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_maturity_snapshots_org ON maturity_snapshots(organisation_id);
CREATE INDEX IF NOT EXISTS idx_maturity_snapshots_org_time ON maturity_snapshots(organisation_id, snapshot_at DESC);

CREATE TABLE IF NOT EXISTS maturity_anomalies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  snapshot_at       TIMESTAMPTZ NOT NULL,
  anomaly_type     VARCHAR(50) NOT NULL,
  severity         VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  score_type      VARCHAR(20) NOT NULL CHECK (score_type IN ('data', 'ai')),
  details         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maturity_anomalies_org ON maturity_anomalies(organisation_id);
CREATE INDEX IF NOT EXISTS idx_maturity_anomalies_org_time ON maturity_anomalies(organisation_id, snapshot_at DESC);
