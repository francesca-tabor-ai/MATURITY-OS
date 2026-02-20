-- Module 3.3: Competitive Position Analysis – reporting queries

-- 1. Historical competitive position analyses for an organisation
-- SELECT id, analysis_date, competitive_risk_level, competitive_risk_score,
--        competitive_advantage_score, comparison_data, created_by
-- FROM competitive_positions
-- WHERE organisation_id = $1
-- ORDER BY analysis_date DESC
-- LIMIT 20;

-- 2. Track change in competitive standing over time (risk level and advantage)
-- SELECT analysis_date, competitive_risk_level, competitive_risk_score, competitive_advantage_score
-- FROM competitive_positions
-- WHERE organisation_id = $1
-- ORDER BY analysis_date ASC;

-- 3. Market leaders: organisations with highest competitive advantage in latest run per org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, competitive_advantage_score, competitive_risk_level
--   FROM competitive_positions
--   ORDER BY organisation_id, analysis_date DESC
-- )
-- SELECT cp.organisation_id, o.name, cp.competitive_advantage_score, cp.competitive_risk_level
-- FROM latest cp
-- JOIN organisations o ON o.id = cp.organisation_id
-- ORDER BY cp.competitive_advantage_score DESC
-- LIMIT 10;

-- 4. Compare organisation against specific competitors (from comparison_data in latest run)
-- SELECT comparison_data->'competitors' AS competitors, comparison_data->'organisation' AS org_scores
-- FROM competitive_positions
-- WHERE organisation_id = $1
-- ORDER BY analysis_date DESC
-- LIMIT 1;
