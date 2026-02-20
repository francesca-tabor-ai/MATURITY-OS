-- Module 1.2: ROI & Investment Calculator™
-- Stores inputs and calculated ROI / payback per organisation

CREATE TABLE IF NOT EXISTS roi_investment_results (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id           UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  -- Inputs (maturity as score 0-100 or stage; we use score for consistency)
  current_data_maturity     NUMERIC(5,2) NOT NULL CHECK (current_data_maturity >= 0 AND current_data_maturity <= 100),
  target_data_maturity      NUMERIC(5,2) NOT NULL CHECK (target_data_maturity >= 0 AND target_data_maturity <= 100),
  current_ai_maturity       NUMERIC(5,2) NOT NULL CHECK (current_ai_maturity >= 0 AND current_ai_maturity <= 100),
  target_ai_maturity        NUMERIC(5,2) NOT NULL CHECK (target_ai_maturity >= 0 AND target_ai_maturity <= 100),
  estimated_financial_benefits NUMERIC(18,2) NOT NULL CHECK (estimated_financial_benefits >= 0),
  annual_benefits           NUMERIC(18,2),
  -- Outputs
  required_data_investment  NUMERIC(18,2) NOT NULL,
  required_ai_investment    NUMERIC(18,2) NOT NULL,
  total_investment          NUMERIC(18,2) NOT NULL,
  expected_roi_pct          NUMERIC(8,2),
  expected_roi_multiplier   NUMERIC(6,2),
  payback_period_months     NUMERIC(8,2),
  payback_period_years      NUMERIC(6,2),
  details                   JSONB DEFAULT '{}',
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  created_by                UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_roi_investment_results_org ON roi_investment_results(organisation_id);
CREATE INDEX IF NOT EXISTS idx_roi_investment_results_created ON roi_investment_results(created_at DESC);
