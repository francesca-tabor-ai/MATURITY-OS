-- Module 4.1: Company Valuation Adjustment Engine – reporting queries

-- 1. Historical valuation adjustments for an organisation
-- SELECT id, analysis_date, current_valuation, data_maturity_index, ai_maturity_score,
--        potential_valuation, valuation_upside, valuation_upside_pct
-- FROM company_valuations
-- WHERE organisation_id = $1
-- ORDER BY analysis_date DESC
-- LIMIT 20;

-- 2. Compare different scenarios (e.g. by current_valuation or maturity inputs)
-- SELECT current_valuation, data_maturity_index, ai_maturity_score,
--        potential_valuation, valuation_upside_pct
-- FROM company_valuations
-- WHERE organisation_id = $1 AND id IN ($2, $3, $4);

-- 3. Aggregate valuation upside across a portfolio (user's orgs)
-- SELECT v.organisation_id, o.name, v.current_valuation, v.potential_valuation,
--        v.valuation_upside, v.valuation_upside_pct, v.analysis_date
-- FROM company_valuations v
-- JOIN organisations o ON o.id = v.organisation_id
-- WHERE v.organisation_id = ANY($1::uuid[])
--   AND v.analysis_date = (SELECT MAX(analysis_date) FROM company_valuations WHERE organisation_id = v.organisation_id)
-- ORDER BY v.valuation_upside_pct DESC NULLS LAST;

-- 4. Companies with highest potential valuation growth (latest run per org)
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, valuation_upside_pct, potential_valuation, current_valuation
--   FROM company_valuations
--   ORDER BY organisation_id, analysis_date DESC
-- )
-- SELECT l.organisation_id, o.name, l.current_valuation, l.potential_valuation, l.valuation_upside_pct
-- FROM latest l
-- JOIN organisations o ON o.id = l.organisation_id
-- ORDER BY l.valuation_upside_pct DESC NULLS LAST
-- LIMIT 10;
