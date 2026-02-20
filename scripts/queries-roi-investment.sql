-- Module 1.2: ROI & Investment reporting queries

-- 1. Historical ROI and investment analyses for an organisation
SELECT id, current_data_maturity, target_data_maturity, current_ai_maturity, target_ai_maturity,
       estimated_financial_benefits, required_data_investment, required_ai_investment, total_investment,
       expected_roi_pct, expected_roi_multiplier, payback_period_years, payback_period_months,
       created_at
FROM roi_investment_results
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC;

-- 2. Compare different investment scenarios (latest 10)
SELECT target_data_maturity, target_ai_maturity, total_investment, expected_roi_pct, payback_period_years
FROM roi_investment_results
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC
LIMIT 10;

-- 3. Aggregate ROI data across organisations (latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id)
    organisation_id, expected_roi_pct, payback_period_years, total_investment, estimated_financial_benefits
  FROM roi_investment_results
  ORDER BY organisation_id, created_at DESC
)
SELECT COUNT(*) AS org_count,
       AVG(expected_roi_pct) AS avg_roi_pct,
       AVG(payback_period_years) AS avg_payback_years,
       SUM(total_investment) AS total_investment_all
FROM latest;

-- 4. Strategies with highest ROI (latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, expected_roi_pct, total_investment, o.name
  FROM roi_investment_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, expected_roi_pct, total_investment
FROM latest
WHERE expected_roi_pct IS NOT NULL
ORDER BY expected_roi_pct DESC
LIMIT 10;

-- 5. Shortest payback periods (latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, payback_period_years, total_investment, o.name
  FROM roi_investment_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, payback_period_years, total_investment
FROM latest
WHERE payback_period_years IS NOT NULL AND payback_period_years > 0
ORDER BY payback_period_years ASC
LIMIT 10;
