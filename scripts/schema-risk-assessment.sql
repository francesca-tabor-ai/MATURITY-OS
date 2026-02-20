-- Module 1.3: Risk Assessment Engine™
-- Stores inputs and calculated risk scores per organisation

CREATE TABLE IF NOT EXISTS risk_assessments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id             UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  -- Category risk scores (0-100)
  ai_misalignment_risk_score  NUMERIC(5,2) NOT NULL CHECK (ai_misalignment_risk_score >= 0 AND ai_misalignment_risk_score <= 100),
  infrastructure_risk_score   NUMERIC(5,2) NOT NULL CHECK (infrastructure_risk_score >= 0 AND infrastructure_risk_score <= 100),
  operational_risk_score      NUMERIC(5,2) NOT NULL CHECK (operational_risk_score >= 0 AND operational_risk_score <= 100),
  strategic_risk_score        NUMERIC(5,2) NOT NULL CHECK (strategic_risk_score >= 0 AND strategic_risk_score <= 100),
  -- Aggregated
  overall_risk_score          NUMERIC(5,2) NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_level                  VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  -- Full engine output (factors, summary)
  details                     JSONB DEFAULT '{}',
  inputs                      JSONB DEFAULT '{}',
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  created_by                  UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_org ON risk_assessments(organisation_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created ON risk_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON risk_assessments(risk_level);
