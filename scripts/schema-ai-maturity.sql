-- Core Module 0.3: AI Maturity Audit Engine™
-- PostgreSQL schema for AI audit inputs and calculated results

-- Raw AI audit inputs per organisation (one row per audit run, JSONB per category)
CREATE TABLE IF NOT EXISTS ai_audit_inputs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  audit_period    VARCHAR(50),
  -- Category payloads (granular responses)
  automation      JSONB DEFAULT '{}',
  ai_usage        JSONB DEFAULT '{}',
  deployment      JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_inputs_org ON ai_audit_inputs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_inputs_created ON ai_audit_inputs(created_at DESC);

-- Calculated AI maturity results (one row per audit run)
CREATE TABLE IF NOT EXISTS ai_maturity_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_input_id      UUID NOT NULL REFERENCES ai_audit_inputs(id) ON DELETE CASCADE,
  organisation_id     UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  -- Category scores (0–100)
  automation_score    NUMERIC(5,2),
  ai_usage_score      NUMERIC(5,2),
  deployment_score   NUMERIC(5,2),
  -- Aggregated metrics
  maturity_stage      SMALLINT NOT NULL CHECK (maturity_stage BETWEEN 1 AND 7),
  maturity_score      NUMERIC(5,2) NOT NULL CHECK (maturity_score >= 0 AND maturity_score <= 100),
  -- Full engine output for reproducibility
  details             JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_maturity_results_org ON ai_maturity_results(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_maturity_results_audit ON ai_maturity_results(audit_input_id);
CREATE INDEX IF NOT EXISTS idx_ai_maturity_results_created ON ai_maturity_results(created_at DESC);
