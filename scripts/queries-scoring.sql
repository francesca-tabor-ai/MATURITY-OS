-- Platform Infrastructure — Scoring Engine: optimized score retrieval
-- Latest Data Maturity, AI Maturity, Alignment (from classification/details), Risk for an organisation.

-- 1. Latest Data Maturity Score
-- SELECT maturity_stage, confidence_score, maturity_index, created_at
-- FROM data_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 2. Latest AI Maturity Score
-- SELECT maturity_stage, maturity_score, created_at
-- FROM ai_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 3. Latest Maturity Classification (matrix + risk + opportunity; alignment can be in details)
-- SELECT data_maturity_index, ai_maturity_score, classification_string,
--        matrix_x_coordinate, matrix_y_coordinate, risk_classification,
--        opportunity_classification, details, created_at
-- FROM maturity_classifications
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 4. Latest Risk Score
-- SELECT overall_risk_score, risk_level,
--        ai_misalignment_risk_score, infrastructure_risk_score,
--        operational_risk_score, strategic_risk_score, created_at
-- FROM risk_assessments
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 5. All four latest scores in one query (subqueries per table)
-- SELECT
--   (SELECT json_build_object('maturity_stage', maturity_stage, 'confidence_score', confidence_score, 'maturity_index', maturity_index)
--    FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1) AS data_maturity,
--   (SELECT json_build_object('maturity_stage', maturity_stage, 'maturity_score', maturity_score)
--    FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1) AS ai_maturity,
--   (SELECT json_build_object('data_maturity_index', data_maturity_index, 'ai_maturity_score', ai_maturity_score, 'classification_string', classification_string, 'risk_classification', risk_classification)
--    FROM maturity_classifications WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1) AS classification,
--   (SELECT json_build_object('overall_risk_score', overall_risk_score, 'risk_level', risk_level)
--    FROM risk_assessments WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1) AS risk;

-- 6. Historical Data Maturity (trend)
-- SELECT created_at, maturity_index, maturity_stage, confidence_score
-- FROM data_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at ASC
-- LIMIT 24;

-- 7. Historical Risk (trend)
-- SELECT created_at, overall_risk_score, risk_level
-- FROM risk_assessments
-- WHERE organisation_id = $1
-- ORDER BY created_at ASC
-- LIMIT 24;
