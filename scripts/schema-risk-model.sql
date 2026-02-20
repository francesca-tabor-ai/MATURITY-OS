-- Platform Infrastructure — Risk Modelling Engine
-- Stores probability of failure and expected financial loss per organisation/initiative.

CREATE TABLE IF NOT EXISTS risk_model_results (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id           UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  initiative_name           VARCHAR(255),
  probability_of_failure    NUMERIC(5,4) NOT NULL CHECK (probability_of_failure >= 0 AND probability_of_failure <= 1),
  confidence_interval_low   NUMERIC(5,4),
  confidence_interval_high  NUMERIC(5,4),
  expected_financial_loss   NUMERIC(18,2) NOT NULL,
  loss_before_mitigation    NUMERIC(18,2),
  risk_tier                VARCHAR(20) CHECK (risk_tier IN ('low', 'medium', 'high')),
  details                  JSONB DEFAULT '{}',
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  created_by                UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_model_results_org ON risk_model_results(organisation_id);
CREATE INDEX IF NOT EXISTS idx_risk_model_results_created ON risk_model_results(organisation_id, created_at DESC);
