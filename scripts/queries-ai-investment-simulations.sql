-- Module 6.1: AI Investment Simulation Engine™ – reporting

-- 1. Historical simulations for an organisation
-- SELECT id, simulation_date, investment_amount, target_area, time_horizon_years,
--        simulated_data_maturity_improvement, simulated_ai_maturity_improvement,
--        projected_profit_increase, projected_revenue_increase
-- FROM ai_investment_simulations
-- WHERE organisation_id = $1
-- ORDER BY simulation_date DESC
-- LIMIT 50;

-- 2. Filter by investment amount range
-- SELECT * FROM ai_investment_simulations
-- WHERE organisation_id = $1 AND investment_amount BETWEEN $2 AND $3
-- ORDER BY projected_profit_increase DESC;

-- 3. Filter by target area
-- SELECT * FROM ai_investment_simulations
-- WHERE organisation_id = $1 AND target_area = $2
-- ORDER BY simulation_date DESC;

-- 4. Strategies with highest projected profit (latest run per scenario pattern)
-- WITH ranked AS (
--   SELECT *, ROW_NUMBER() OVER (PARTITION BY target_area ORDER BY simulation_date DESC) AS rn
--   FROM ai_investment_simulations
--   WHERE organisation_id = $1
-- )
-- SELECT investment_amount, target_area, time_horizon_years, projected_profit_increase, projected_revenue_increase
-- FROM ranked WHERE rn = 1
-- ORDER BY projected_profit_increase DESC;
