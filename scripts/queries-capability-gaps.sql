-- Module 2.2: Capability Gap Analysis – reporting queries

-- 1. Historical capability gap analyses for an organisation (grouped by analysis_date)
-- SELECT analysis_date, COUNT(*) AS gap_count,
--        COUNT(*) FILTER (WHERE priority_level = 'High') AS high_count,
--        array_agg(DISTINCT grouped_theme) AS themes
-- FROM capability_gaps
-- WHERE organisation_id = $1
-- GROUP BY organisation_id, analysis_date
-- ORDER BY analysis_date DESC
-- LIMIT 20;

-- 2. All gaps for a specific analysis run (by organisation + latest analysis_date)
-- WITH latest AS (
--   SELECT analysis_date FROM capability_gaps
--   WHERE organisation_id = $1
--   ORDER BY analysis_date DESC LIMIT 1
-- )
-- SELECT id, gap_description, priority_level, grouped_theme, dimension
-- FROM capability_gaps c
-- WHERE c.organisation_id = $1 AND c.analysis_date = (SELECT analysis_date FROM latest);

-- 3. Track resolution: compare two analyses (gaps that appeared vs disappeared)
-- WITH run1 AS (
--   SELECT gap_description FROM capability_gaps
--   WHERE organisation_id = $1 AND analysis_date = $2
-- ), run2 AS (
--   SELECT gap_description FROM capability_gaps
--   WHERE organisation_id = $1 AND analysis_date = $3
-- )
-- SELECT 'resolved' AS status, r1.gap_description
-- FROM run1 r1 LEFT JOIN run2 r2 ON r1.gap_description = r2.gap_description WHERE r2.gap_description IS NULL
-- UNION ALL
-- SELECT 'new' AS status, r2.gap_description
-- FROM run2 r2 LEFT JOIN run1 r1 ON r2.gap_description = r1.gap_description WHERE r1.gap_description IS NULL;

-- 4. Common capability gaps across organisations (frequency count)
-- SELECT gap_description, priority_level, grouped_theme, COUNT(DISTINCT organisation_id) AS org_count
-- FROM capability_gaps c
-- WHERE analysis_date >= NOW() - INTERVAL '1 year'
-- GROUP BY gap_description, priority_level, grouped_theme
-- ORDER BY org_count DESC
-- LIMIT 30;

-- 5. Filter gaps by priority level for an organisation
-- SELECT gap_description, grouped_theme, dimension, analysis_date
-- FROM capability_gaps
-- WHERE organisation_id = $1 AND priority_level = $2
-- ORDER BY analysis_date DESC;

-- 6. Filter gaps by theme for an organisation
-- SELECT gap_description, priority_level, dimension, analysis_date
-- FROM capability_gaps
-- WHERE organisation_id = $1 AND grouped_theme = $2
-- ORDER BY priority_level, analysis_date DESC;
