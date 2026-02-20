-- Module 6.3: Enterprise Digital Twin™
-- Stores digital twin state snapshots (current and simulated) per organisation.
-- JSONB state holds full twin model: maturity, financial, risk, capabilities, roadmap, nodes, edges.

CREATE TABLE IF NOT EXISTS digital_twin_states (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scenario_label    VARCHAR(255) NULL,
  state             JSONB NOT NULL DEFAULT '{}',
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_digital_twin_states_org ON digital_twin_states(organisation_id);
CREATE INDEX IF NOT EXISTS idx_digital_twin_states_captured ON digital_twin_states(organisation_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_twin_states_label ON digital_twin_states(organisation_id, scenario_label) WHERE scenario_label IS NOT NULL;

-- GIN index for querying nested JSONB attributes (e.g. state->'maturity'->>'data_maturity_index')
CREATE INDEX IF NOT EXISTS idx_digital_twin_states_state_gin ON digital_twin_states USING GIN (state jsonb_path_ops);
