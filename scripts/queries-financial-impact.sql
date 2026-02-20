-- Module 1.1: Financial impact reporting queries

-- 1. Historical financial impact analyses for an organisation
SELECT id, revenue_input, profit_margin_input, headcount_input, data_maturity_score, ai_maturity_score,
       revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction,
       industry_benchmark, created_at
FROM financial_impact_results
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC;

-- 2. Compare financial projections over time (last 10)
SELECT created_at, revenue_upside, profit_margin_expansion_value, cost_reduction,
       revenue_input + revenue_upside AS projected_revenue
FROM financial_impact_results
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC
LIMIT 10;

-- 3. Aggregate financial impact across organisations (latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id)
    organisation_id, revenue_upside, cost_reduction, profit_margin_expansion_pct
  FROM financial_impact_results
  ORDER BY organisation_id, created_at DESC
)
SELECT COUNT(*) AS org_count,
       SUM(revenue_upside) AS total_revenue_upside_potential,
       SUM(cost_reduction) AS total_cost_reduction_potential,
       AVG(profit_margin_expansion_pct) AS avg_margin_expansion_pct
FROM latest;

-- 4. Organisations with highest potential revenue upside (latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, revenue_upside, revenue_input, o.name
  FROM financial_impact_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, revenue_upside, revenue_input
FROM latest
ORDER BY revenue_upside DESC
LIMIT 10;

-- 5. Organisations with highest cost reduction potential (latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, cost_reduction, o.name
  FROM financial_impact_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, cost_reduction
FROM latest
ORDER BY cost_reduction DESC
LIMIT 10;
