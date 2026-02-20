-- Module 1.1: Financial Impact Engine™
-- Stores inputs and calculated financial impact per organisation

CREATE TABLE IF NOT EXISTS financial_impact_results (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id         UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  -- Inputs
  revenue_input           NUMERIC(18,2) NOT NULL CHECK (revenue_input >= 0),
  profit_margin_input     NUMERIC(5,2) NOT NULL CHECK (profit_margin_input >= 0 AND profit_margin_input <= 100),
  headcount_input         INTEGER NOT NULL CHECK (headcount_input >= 0),
  industry_benchmark      VARCHAR(100),
  data_maturity_score     NUMERIC(5,2) NOT NULL CHECK (data_maturity_score >= 0 AND data_maturity_score <= 100),
  ai_maturity_score       NUMERIC(5,2) NOT NULL CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
  operational_cost_input  NUMERIC(18,2),
  -- Outputs
  revenue_upside          NUMERIC(18,2) NOT NULL,
  profit_margin_expansion_pct NUMERIC(5,2),
  profit_margin_expansion_value NUMERIC(18,2),
  cost_reduction          NUMERIC(18,2) NOT NULL,
  -- Full engine output for reproducibility
  details                 JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  created_by              UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_financial_impact_results_org ON financial_impact_results(organisation_id);
CREATE INDEX IF NOT EXISTS idx_financial_impact_results_created ON financial_impact_results(created_at DESC);
