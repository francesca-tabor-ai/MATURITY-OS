-- Module 2.2: Capability Gap Analysis™
-- Stores identified capability gaps per organisation (one row per gap per analysis run)

CREATE TABLE IF NOT EXISTS capability_gaps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  analysis_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gap_description   TEXT NOT NULL,
  priority_level     VARCHAR(20) NOT NULL CHECK (priority_level IN ('High', 'Medium', 'Low')),
  grouped_theme     VARCHAR(100) NOT NULL,
  dimension         VARCHAR(80),  -- e.g. data_collection, data_governance, ai_usage, deployment
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_capability_gaps_org ON capability_gaps(organisation_id);
CREATE INDEX IF NOT EXISTS idx_capability_gaps_analysis_date ON capability_gaps(organisation_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_capability_gaps_priority ON capability_gaps(priority_level);
CREATE INDEX IF NOT EXISTS idx_capability_gaps_theme ON capability_gaps(grouped_theme);
