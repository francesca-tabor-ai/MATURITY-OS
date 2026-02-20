-- Platform Infrastructure — API Layer: optimized data retrieval queries
-- Use indexes, minimal joins, and pagination for API endpoints.

-- 1. Data maturity: latest score (index: data_maturity_results organisation_id, created_at DESC)
-- SELECT maturity_stage, confidence_score, maturity_index,
--        collection_score, storage_score, integration_score, governance_score, accessibility_score, created_at
-- FROM data_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 2. Data maturity history with pagination
-- SELECT id, maturity_stage, confidence_score, maturity_index, created_at
-- FROM data_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT $2 OFFSET $3;

-- 3. AI maturity: latest score
-- SELECT maturity_stage, maturity_score, automation_score, ai_usage_score, deployment_score, created_at
-- FROM ai_maturity_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 4. Financial impact: latest result
-- SELECT id, revenue_input, profit_margin_input, headcount_input, data_maturity_score, ai_maturity_score,
--        revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction,
--        industry_benchmark, created_at
-- FROM financial_impact_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 5. ROI: latest result
-- SELECT id, current_data_maturity, target_data_maturity, current_ai_maturity, target_ai_maturity,
--        required_data_investment, required_ai_investment, total_investment,
--        expected_roi_pct, expected_roi_multiplier, payback_period_months, payback_period_years, created_at
-- FROM roi_investment_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 6. Risk: latest assessment
-- SELECT id, ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score,
--        overall_risk_score, risk_level, details, created_at
-- FROM risk_assessments
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 7. Roadmap: latest
-- SELECT id, generation_date, roadmap, inputs
-- FROM transformation_roadmaps
-- WHERE organisation_id = $1
-- ORDER BY generation_date DESC
-- LIMIT 1;

-- 8. Portfolio summary (investor): all orgs for user with latest maturity/financial per org
-- SELECT o.id AS organisation_id, o.name,
--        (SELECT maturity_index FROM data_maturity_results r WHERE r.organisation_id = o.id ORDER BY r.created_at DESC LIMIT 1) AS data_maturity_index,
--        (SELECT maturity_score FROM ai_maturity_results r WHERE r.organisation_id = o.id ORDER BY r.created_at DESC LIMIT 1) AS ai_maturity_score,
--        (SELECT revenue_input FROM financial_impact_results f WHERE f.organisation_id = o.id ORDER BY f.created_at DESC LIMIT 1) AS revenue,
--        (SELECT profit_margin_input FROM financial_impact_results f WHERE f.organisation_id = o.id ORDER BY f.created_at DESC LIMIT 1) AS profit_margin
-- FROM user_organisations uo
-- JOIN organisations o ON o.id = uo.organisation_id
-- WHERE uo.user_id = $1;

-- Recommended indexes (if not already present)
-- CREATE INDEX IF NOT EXISTS idx_data_maturity_results_org_created ON data_maturity_results(organisation_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_ai_maturity_results_org_created ON ai_maturity_results(organisation_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_financial_impact_results_org_created ON financial_impact_results(organisation_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_roi_investment_results_org_created ON roi_investment_results(organisation_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_risk_assessments_org_created ON risk_assessments(organisation_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_transformation_roadmaps_org_date ON transformation_roadmaps(organisation_id, generation_date DESC);
