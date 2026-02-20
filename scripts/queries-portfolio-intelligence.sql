-- Module 4.2: Portfolio Intelligence Dashboard™ – data access and reporting

-- 1. Portfolio org list (for a given user; optionally filter by industry)
-- SELECT o.id, o.name, o.industry
-- FROM organisations o
-- JOIN user_organisations uo ON uo.organisation_id = o.id
-- WHERE uo.user_id = $1
--   AND ($2::varchar IS NULL OR LOWER(TRIM(o.industry)) = LOWER(TRIM($2)))
-- ORDER BY o.name;

-- 2. Latest data maturity per portfolio org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, maturity_index
--   FROM data_maturity_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- ) SELECT organisation_id, maturity_index FROM latest;

-- 3. Latest AI maturity per portfolio org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, maturity_score
--   FROM ai_maturity_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- ) SELECT organisation_id, maturity_score FROM latest;

-- 4. Latest financial impact per portfolio org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, revenue_upside, profit_margin_expansion_value, cost_reduction
--   FROM financial_impact_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- ) SELECT organisation_id, revenue_upside, profit_margin_expansion_value, cost_reduction FROM latest;

-- 5. Latest ROI per portfolio org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, total_investment, expected_roi_pct, payback_period_years
--   FROM roi_investment_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- ) SELECT organisation_id, total_investment, expected_roi_pct, payback_period_years FROM latest;

-- 6. Latest risk assessment per portfolio org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, overall_risk_score, risk_level
--   FROM risk_assessments
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- ) SELECT organisation_id, overall_risk_score, risk_level FROM latest;

-- 7. Latest company valuation per portfolio org
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, current_valuation, potential_valuation, valuation_upside, valuation_upside_pct
--   FROM company_valuations
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, analysis_date DESC
-- ) SELECT organisation_id, current_valuation, potential_valuation, valuation_upside, valuation_upside_pct FROM latest;

-- 8. Portfolio-level: average data/AI maturity (application-layer aggregation)
--    Use results from queries 2 and 3; avg in app.

-- 9. Portfolio-level: total revenue upside and total valuation upside (application-layer)
--    Sum revenue_upside from query 4 and valuation_upside from query 7.

-- 10. Top N companies by valuation upside % (within portfolio)
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, valuation_upside_pct, valuation_upside, current_valuation, potential_valuation
--   FROM company_valuations
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, analysis_date DESC
-- )
-- SELECT l.organisation_id, o.name, o.industry, l.current_valuation, l.potential_valuation, l.valuation_upside, l.valuation_upside_pct
-- FROM latest l
-- JOIN organisations o ON o.id = l.organisation_id
-- ORDER BY l.valuation_upside_pct DESC NULLS LAST
-- LIMIT $2;

-- 11. Bottom N companies by average maturity (data + AI) / 2 (application-layer)
--    Combine data and AI scores per org from queries 2 and 3, compute (d+a)/2, sort ascending, take first N.

-- 12. Top N companies by revenue upside (within portfolio)
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, revenue_upside
--   FROM financial_impact_results
--   WHERE organisation_id = ANY($1::uuid[])
--   ORDER BY organisation_id, created_at DESC
-- )
-- SELECT l.organisation_id, o.name, l.revenue_upside
-- FROM latest l
-- JOIN organisations o ON o.id = l.organisation_id
-- ORDER BY l.revenue_upside DESC NULLS LAST
-- LIMIT $2;
