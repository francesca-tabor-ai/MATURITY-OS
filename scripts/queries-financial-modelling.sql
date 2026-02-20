-- Platform Infrastructure — Financial Modelling Engine: optimized retrieval
-- Latest metrics and historical trend for dashboards and integrations.

-- 1. Latest financial impact for one organisation (index: organisation_id, created_at DESC)
-- SELECT id, revenue_input, profit_margin_input, headcount_input,
--        data_maturity_score, ai_maturity_score,
--        revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction,
--        details, created_at
-- FROM financial_impact_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 2. Latest metrics only (minimal columns for real-time dashboard)
-- SELECT revenue_upside, profit_margin_expansion_value, cost_reduction, created_at
-- FROM financial_impact_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 3. Historical trend: revenue_upside and cost_reduction over time (last N)
-- SELECT created_at, revenue_upside, cost_reduction,
--        revenue_upside + cost_reduction AS combined_impact
-- FROM financial_impact_results
-- WHERE organisation_id = $1
-- ORDER BY created_at ASC
-- LIMIT 24;

-- 4. Paginated history with full row
-- SELECT id, revenue_input, revenue_upside, cost_reduction, created_at
-- FROM financial_impact_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT $2 OFFSET $3;

-- 5. Extract orchestrator report from details (when persisted via financial-model/calculate)
-- SELECT id, created_at,
--        details->'summary'->>'total_revenue_upside' AS total_revenue_upside,
--        details->'summary'->>'total_cost_savings' AS total_cost_savings,
--        details->'summary'->>'net_profit_increase' AS net_profit_increase,
--        details->'summary'->>'tax_adjusted_profit_increase' AS tax_adjusted_profit_increase
-- FROM financial_impact_results
-- WHERE organisation_id = $1 AND details ? 'summary'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Recommended index if not already present (schema-financial-impact.sql may already have these)
-- CREATE INDEX IF NOT EXISTS idx_financial_impact_results_org_created
--   ON financial_impact_results(organisation_id, created_at DESC);
