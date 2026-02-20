-- Module 2.3: Executive Dashboard™ – data access queries

-- 1. Latest data maturity result for an organisation
-- SELECT id, maturity_stage, maturity_index, confidence_score,
--        collection_score, storage_score, integration_score, governance_score, accessibility_score, created_at
-- FROM data_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC LIMIT 1;

-- 2. Latest AI maturity result for an organisation
-- SELECT id, maturity_stage, maturity_score, automation_score, ai_usage_score, deployment_score, created_at
-- FROM ai_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC LIMIT 1;

-- 3. Latest maturity classification for an organisation
-- SELECT id, data_maturity_index, ai_maturity_score, classification_string,
--        matrix_x_coordinate, matrix_y_coordinate, risk_classification, opportunity_classification, created_at
-- FROM maturity_classifications
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC LIMIT 1;

-- 4. Latest financial impact result for an organisation
-- SELECT id, revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction, created_at
-- FROM financial_impact_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC LIMIT 1;

-- 5. Latest ROI/investment result for an organisation
-- SELECT id, total_investment, expected_roi_pct, payback_period_years, created_at
-- FROM roi_investment_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC LIMIT 1;

-- 6. Latest risk assessment for an organisation
-- SELECT id, overall_risk_score, risk_level, ai_misalignment_risk_score, infrastructure_risk_score,
--        operational_risk_score, strategic_risk_score, created_at
-- FROM risk_assessments
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC LIMIT 1;

-- 7. Latest transformation roadmap for an organisation
-- SELECT id, generation_date, roadmap, inputs
-- FROM transformation_roadmaps
-- WHERE organisation_id = $1
-- ORDER BY generation_date DESC LIMIT 1;

-- 8. Historical trend: data maturity index over time (last 12 months)
-- SELECT date_trunc('month', created_at) AS month, AVG(maturity_index) AS avg_index, MAX(created_at) AS latest
-- FROM data_maturity_results
-- WHERE organisation_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
-- GROUP BY date_trunc('month', created_at)
-- ORDER BY month;

-- 9. Historical trend: AI maturity score over time (last 12 months)
-- SELECT date_trunc('month', created_at) AS month, AVG(maturity_score) AS avg_score, MAX(created_at) AS latest
-- FROM ai_maturity_results
-- WHERE organisation_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
-- GROUP BY date_trunc('month', created_at)
-- ORDER BY month;

-- 10. Historical trend: financial impact totals over time
-- SELECT date_trunc('month', created_at) AS month,
--        AVG(revenue_upside + COALESCE(profit_margin_expansion_value, 0) + cost_reduction) AS total_impact
-- FROM financial_impact_results
-- WHERE organisation_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
-- GROUP BY date_trunc('month', created_at)
-- ORDER BY month;
