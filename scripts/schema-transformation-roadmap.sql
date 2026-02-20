-- Module 2.1: Transformation Roadmap Generator™
-- Stores generated phased roadmaps per organisation

CREATE TABLE IF NOT EXISTS transformation_roadmaps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id    UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  generation_date   TIMESTAMPTZ DEFAULT NOW(),
  -- Inputs snapshot for reproducibility (optional)
  inputs            JSONB DEFAULT '{}',
  -- Full phased roadmap: phases[], each with actions[], cost, impact
  roadmap           JSONB NOT NULL,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transformation_roadmaps_org ON transformation_roadmaps(organisation_id);
CREATE INDEX IF NOT EXISTS idx_transformation_roadmaps_date ON transformation_roadmaps(generation_date DESC);
