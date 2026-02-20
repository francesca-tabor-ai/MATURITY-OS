-- Module 5.3: Maturity Progress Tracking™
-- Stores target maturity goals per organisation

CREATE TABLE IF NOT EXISTS maturity_goals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  goal_type         VARCHAR(30) NOT NULL CHECK (goal_type IN ('data', 'ai')),
  target_score      NUMERIC(5,2) NOT NULL CHECK (target_score >= 0 AND target_score <= 100),
  target_date       DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(organisation_id, goal_type)
);

CREATE INDEX IF NOT EXISTS idx_maturity_goals_org ON maturity_goals(organisation_id);
