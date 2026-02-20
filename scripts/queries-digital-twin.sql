-- Module 6.3: Enterprise Digital Twin™ – query examples
-- Retrieve historical states, compare versions, extract metrics from JSONB.

-- 1. Historical states for an organisation (latest N)
-- SELECT id, captured_at, scenario_label, state
-- FROM digital_twin_states
-- WHERE organisation_id = $1
-- ORDER BY captured_at DESC
-- LIMIT 50;

-- 2. Specific historical state by id
-- SELECT id, organisation_id, captured_at, scenario_label, state
-- FROM digital_twin_states
-- WHERE id = $1 AND organisation_id = $2;

-- 3. Compare two versions (e.g. before and after intervention)
-- SELECT a.captured_at AS before_at, b.captured_at AS after_at,
--        (a.state->'maturity'->>'data_maturity_index')::numeric AS before_data_maturity,
--        (b.state->'maturity'->>'data_maturity_index')::numeric AS after_data_maturity,
--        (a.state->'financial'->>'revenue')::numeric AS before_revenue,
--        (b.state->'financial'->>'revenue')::numeric AS after_revenue
-- FROM digital_twin_states a
-- JOIN digital_twin_states b ON b.organisation_id = a.organisation_id AND b.captured_at > a.captured_at
-- WHERE a.organisation_id = $1 AND a.id = $2 AND b.id = $3;

-- 4. Extract specific metrics from latest state
-- SELECT captured_at,
--        state->'maturity'->>'data_maturity_index' AS data_maturity_index,
--        state->'maturity'->>'ai_maturity_score' AS ai_maturity_score,
--        (state->'financial'->>'revenue')::numeric AS revenue,
--        (state->'financial'->>'profit')::numeric AS profit,
--        state->'risk'->>'overall_risk_score' AS risk_score
-- FROM digital_twin_states
-- WHERE organisation_id = $1
-- ORDER BY captured_at DESC
-- LIMIT 1;

-- 5. Find states by scenario label (e.g. 'current', 'simulated', 'post-intervention')
-- SELECT id, captured_at, scenario_label, state
-- FROM digital_twin_states
-- WHERE organisation_id = $1 AND scenario_label = $2
-- ORDER BY captured_at DESC;

-- 6. Time-series of a nested metric (e.g. data maturity over time)
-- SELECT captured_at,
--        (state->'maturity'->>'data_maturity_index')::numeric AS data_maturity_index
-- FROM digital_twin_states
-- WHERE organisation_id = $1
-- ORDER BY captured_at ASC;

-- 7. States where data maturity exceeded a threshold
-- SELECT id, captured_at, (state->'maturity'->>'data_maturity_index')::numeric AS data_maturity_index
-- FROM digital_twin_states
-- WHERE organisation_id = $1
--   AND (state->'maturity'->>'data_maturity_index')::numeric >= 70
-- ORDER BY captured_at DESC;
