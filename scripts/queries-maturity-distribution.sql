-- Module 3.2: Maturity Distribution Visualisation™

-- 1. Latest data maturity per organisation (for a set of org IDs)
-- WITH latest_data AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, maturity_index AS score, created_at
--   FROM data_maturity_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- )
-- SELECT organisation_id, score, created_at FROM latest_data;

-- 2. Latest AI maturity per organisation (for a set of org IDs)
-- WITH latest_ai AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, maturity_score AS score, created_at
--   FROM ai_maturity_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- )
-- SELECT organisation_id, score, created_at FROM latest_ai;

-- 3. Organisation IDs for user's portfolio (optionally filter by industry)
-- SELECT o.id FROM organisations o
-- JOIN user_organisations uo ON uo.organisation_id = o.id
-- WHERE uo.user_id = $1 AND ($2::varchar IS NULL OR LOWER(TRIM(o.industry)) = LOWER(TRIM($2)));

-- 4. Statistical aggregates in PostgreSQL (mean, stddev, percentiles) for data maturity
-- SELECT
--   AVG(score) AS mean,
--   STDDEV(score) AS std_dev,
--   PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) AS median,
--   PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY score) AS q1,
--   PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score) AS q3,
--   MIN(score) AS min,
--   MAX(score) AS max,
--   COUNT(*) AS n
-- FROM (SELECT maturity_index AS score FROM data_maturity_results WHERE organisation_id = ANY($1::uuid[]) AND ... ) t;
