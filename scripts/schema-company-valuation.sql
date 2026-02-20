-- Module 4.1: Company Valuation Adjustment Engine™
-- Stores valuation adjustment inputs and outputs per organisation

CREATE TABLE IF NOT EXISTS company_valuations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id         UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  analysis_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_valuation       NUMERIC(18,2) NOT NULL CHECK (current_valuation >= 0),
  data_maturity_index      NUMERIC(5,2) NOT NULL CHECK (data_maturity_index >= 0 AND data_maturity_index <= 100),
  ai_maturity_score        NUMERIC(5,2) NOT NULL CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
  potential_valuation      NUMERIC(18,2) NOT NULL CHECK (potential_valuation >= 0),
  valuation_upside         NUMERIC(18,2) NOT NULL,
  valuation_upside_pct     NUMERIC(6,2),
  details                  JSONB DEFAULT '{}',
  created_by               UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_company_valuations_org ON company_valuations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_company_valuations_date ON company_valuations(organisation_id, analysis_date DESC);
