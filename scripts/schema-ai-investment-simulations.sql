-- Module 6.1: AI Investment Simulation Engine™
-- Stores simulation inputs and outcomes per organisation

CREATE TABLE IF NOT EXISTS ai_investment_simulations (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id               UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  simulation_date               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  investment_amount             NUMERIC(18,2) NOT NULL CHECK (investment_amount >= 0),
  target_area                   VARCHAR(20) NOT NULL CHECK (target_area IN ('data', 'ai', 'both')),
  time_horizon_years            NUMERIC(5,2) NOT NULL CHECK (time_horizon_years > 0),
  simulated_data_maturity_improvement NUMERIC(5,2) NOT NULL DEFAULT 0,
  simulated_ai_maturity_improvement   NUMERIC(5,2) NOT NULL DEFAULT 0,
  projected_profit_increase     NUMERIC(18,2) NOT NULL DEFAULT 0,
  projected_revenue_increase    NUMERIC(18,2) NOT NULL DEFAULT 0,
  details                       JSONB DEFAULT '{}',
  created_by                    UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_investment_simulations_org ON ai_investment_simulations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_investment_simulations_date ON ai_investment_simulations(organisation_id, simulation_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_investment_simulations_target ON ai_investment_simulations(organisation_id, target_area);
