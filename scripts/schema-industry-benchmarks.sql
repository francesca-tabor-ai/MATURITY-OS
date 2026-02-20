-- Module 3.1: Industry Benchmark Engine™
-- Benchmark data per industry/maturity type; comparison results per organisation

-- Industry benchmark reference data (average scores, distribution)
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name       VARCHAR(100) NOT NULL,
  maturity_type       VARCHAR(20) NOT NULL CHECK (maturity_type IN ('Data', 'AI')),
  average_score       NUMERIC(5,2) NOT NULL CHECK (average_score >= 0 AND average_score <= 100),
  score_distribution  JSONB DEFAULT '{}',  -- e.g. { "p25": 35, "p50": 50, "p75": 65, "std_dev": 15 }
  UNIQUE(industry_name, maturity_type)
);

CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_industry ON industry_benchmarks(industry_name);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_type ON industry_benchmarks(maturity_type);

-- Store each organisation benchmark comparison run
CREATE TABLE IF NOT EXISTS organisation_benchmarks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id       UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  industry_used         VARCHAR(100) NOT NULL,
  data_maturity_score   NUMERIC(5,2) NOT NULL,
  ai_maturity_score     NUMERIC(5,2) NOT NULL,
  industry_data_avg     NUMERIC(5,2) NOT NULL,
  industry_ai_avg       NUMERIC(5,2) NOT NULL,
  data_comparison       VARCHAR(20) NOT NULL CHECK (data_comparison IN ('Above average', 'At average', 'Below average')),
  ai_comparison         VARCHAR(20) NOT NULL CHECK (ai_comparison IN ('Above average', 'At average', 'Below average')),
  data_pct_diff         NUMERIC(6,2),  -- percentage difference from industry average
  ai_pct_diff           NUMERIC(6,2),
  report                JSONB DEFAULT '{}',  -- full report for replay
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  created_by            UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_organisation_benchmarks_org ON organisation_benchmarks(organisation_id);
CREATE INDEX IF NOT EXISTS idx_organisation_benchmarks_created ON organisation_benchmarks(created_at DESC);
