-- Module 6.2: Strategic Decision Simulator™
-- Stores scenario definitions and simulated outcomes per organisation

CREATE TABLE IF NOT EXISTS strategic_simulations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id      UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  simulation_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scenario_name        VARCHAR(255) NOT NULL,
  scenario_parameters  JSONB NOT NULL DEFAULT '{}',
  simulated_outcomes   JSONB NOT NULL DEFAULT '{}',
  created_by           UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_strategic_simulations_org ON strategic_simulations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_strategic_simulations_date ON strategic_simulations(organisation_id, simulation_date DESC);
