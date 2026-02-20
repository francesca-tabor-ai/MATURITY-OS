-- Module 4.3: Acquisition Opportunity Scanner™
-- Stores scan results: undervaluation and acquisition attractiveness per organisation

CREATE TABLE IF NOT EXISTS acquisition_opportunities (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id                 UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  scan_date                       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  undervaluation_score             NUMERIC(5,2) NOT NULL CHECK (undervaluation_score >= 0 AND undervaluation_score <= 100),
  acquisition_attractiveness_score NUMERIC(5,2) NOT NULL CHECK (acquisition_attractiveness_score >= 0 AND acquisition_attractiveness_score <= 100),
  details                         JSONB DEFAULT '{}',
  created_by                      UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_acquisition_opportunities_org ON acquisition_opportunities(organisation_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_opportunities_scan_date ON acquisition_opportunities(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_acquisition_opportunities_attractiveness ON acquisition_opportunities(acquisition_attractiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_acquisition_opportunities_undervaluation ON acquisition_opportunities(undervaluation_score DESC);
