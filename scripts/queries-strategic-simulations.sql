-- Module 6.2: Strategic Decision Simulator™ – reporting

-- 1. Historical simulations for an organisation
-- SELECT id, simulation_date, scenario_name, scenario_parameters, simulated_outcomes
-- FROM strategic_simulations
-- WHERE organisation_id = $1
-- ORDER BY simulation_date DESC
-- LIMIT 50;

-- 2. Compare outcomes: extract end_profit, total_profit_over_horizon from simulated_outcomes JSONB
-- SELECT scenario_name, simulated_outcomes->'end_profit' AS end_profit,
--        simulated_outcomes->'total_profit_over_horizon' AS total_profit
-- FROM strategic_simulations
-- WHERE organisation_id = $1 AND simulation_date >= $2
-- ORDER BY (simulated_outcomes->>'total_profit_over_horizon')::numeric DESC;

-- 3. Filter by parameter (e.g. investment_level = 'high')
-- SELECT * FROM strategic_simulations
-- WHERE organisation_id = $1 AND scenario_parameters->>'investment_level' = 'high'
-- ORDER BY simulation_date DESC;

-- 4. Highest projected financial gains
-- SELECT scenario_name, scenario_parameters,
--        (simulated_outcomes->>'end_valuation')::numeric AS end_valuation,
--        (simulated_outcomes->>'total_profit_over_horizon')::numeric AS total_profit
-- FROM strategic_simulations
-- WHERE organisation_id = $1
-- ORDER BY (simulated_outcomes->>'total_profit_over_horizon')::numeric DESC NULLS LAST
-- LIMIT 10;
