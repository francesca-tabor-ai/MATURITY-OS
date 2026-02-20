-- Core Module 0.4: Maturity Classification Engine™
-- Stores classification results per organisation (data + AI maturity → matrix position, risk, opportunity)

CREATE TABLE IF NOT EXISTS maturity_classifications (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id           UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  data_maturity_index       NUMERIC(5,2) NOT NULL CHECK (data_maturity_index >= 0 AND data_maturity_index <= 100),
  ai_maturity_score         NUMERIC(5,2) NOT NULL CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
  classification_string     VARCHAR(100) NOT NULL,
  matrix_x_coordinate       NUMERIC(5,2) NOT NULL,
  matrix_y_coordinate       NUMERIC(5,2) NOT NULL,
  risk_classification       VARCHAR(50) NOT NULL,
  opportunity_classification VARCHAR(150),
  -- Optional references to source audits
  data_audit_result_id     UUID REFERENCES data_maturity_results(id) ON DELETE SET NULL,
  ai_audit_result_id        UUID REFERENCES ai_maturity_results(id) ON DELETE SET NULL,
  details                   JSONB DEFAULT '{}',
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maturity_classifications_org ON maturity_classifications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_maturity_classifications_created ON maturity_classifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maturity_classifications_risk ON maturity_classifications(risk_classification);
CREATE INDEX IF NOT EXISTS idx_maturity_classifications_opportunity ON maturity_classifications(opportunity_classification);
