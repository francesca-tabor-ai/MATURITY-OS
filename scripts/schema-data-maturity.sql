-- Core Module 0.2: Data Maturity Audit Engine™
-- PostgreSQL schema for audit inputs and calculated results

-- Raw audit inputs per organisation (one row per audit run, JSONB per category)
CREATE TABLE IF NOT EXISTS data_audit_inputs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  audit_period    VARCHAR(50),
  -- Category payloads (granular responses)
  collection      JSONB DEFAULT '{}',
  storage         JSONB DEFAULT '{}',
  integration     JSONB DEFAULT '{}',
  governance      JSONB DEFAULT '{}',
  accessibility   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_data_audit_inputs_org ON data_audit_inputs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_data_audit_inputs_created ON data_audit_inputs(created_at DESC);

-- Calculated data maturity results (one row per audit run)
CREATE TABLE IF NOT EXISTS data_maturity_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_input_id      UUID NOT NULL REFERENCES data_audit_inputs(id) ON DELETE CASCADE,
  organisation_id     UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  -- Category scores (0–100)
  collection_score    NUMERIC(5,2),
  storage_score       NUMERIC(5,2),
  integration_score   NUMERIC(5,2),
  governance_score    NUMERIC(5,2),
  accessibility_score NUMERIC(5,2),
  -- Aggregated metrics
  maturity_stage      SMALLINT NOT NULL CHECK (maturity_stage BETWEEN 1 AND 6),
  confidence_score    NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  maturity_index      NUMERIC(5,2) NOT NULL CHECK (maturity_index >= 0 AND maturity_index <= 100),
  -- Full engine output for reproducibility
  details             JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_maturity_results_org ON data_maturity_results(organisation_id);
CREATE INDEX IF NOT EXISTS idx_data_maturity_results_audit ON data_maturity_results(audit_input_id);
CREATE INDEX IF NOT EXISTS idx_data_maturity_results_created ON data_maturity_results(created_at DESC);
