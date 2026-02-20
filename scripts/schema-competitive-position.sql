-- Module 3.3: Competitive Position Analysis™
-- Stores competitive analysis results per organisation (one row per analysis run)

CREATE TABLE IF NOT EXISTS competitive_positions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id            UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  analysis_date              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  competitive_risk_level     VARCHAR(20) NOT NULL CHECK (competitive_risk_level IN ('Low', 'Medium', 'High')),
  competitive_risk_score     NUMERIC(5,2) NOT NULL CHECK (competitive_risk_score >= 0 AND competitive_risk_score <= 100),
  competitive_advantage_score NUMERIC(5,2) NOT NULL CHECK (competitive_advantage_score >= 0 AND competitive_advantage_score <= 100),
  comparison_data             JSONB DEFAULT '{}',  -- org scores, competitor ids/scores, insights
  created_by                 UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_competitive_positions_org ON competitive_positions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_competitive_positions_date ON competitive_positions(organisation_id, analysis_date DESC);
