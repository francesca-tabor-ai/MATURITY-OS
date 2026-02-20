-- Platform Infrastructure — Risk Modelling Engine: optimized retrieval

-- 1. Latest risk model result for an organisation
-- SELECT id, initiative_name, probability_of_failure, confidence_interval_low, confidence_interval_high,
--        expected_financial_loss, loss_before_mitigation, risk_tier, details, created_at
-- FROM risk_model_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 2. Latest metrics only (dashboard)
-- SELECT probability_of_failure, expected_financial_loss, risk_tier, created_at
-- FROM risk_model_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 3. Historical trend: probability and expected loss over time
-- SELECT created_at, probability_of_failure, expected_financial_loss, risk_tier
-- FROM risk_model_results
-- WHERE organisation_id = $1
-- ORDER BY created_at ASC
-- LIMIT 24;

-- 4. By initiative name
-- SELECT id, initiative_name, probability_of_failure, expected_financial_loss, created_at
-- FROM risk_model_results
-- WHERE organisation_id = $1 AND initiative_name = $2
-- ORDER BY created_at DESC
-- LIMIT 1;

-- 5. Paginated history
-- SELECT id, initiative_name, probability_of_failure, expected_financial_loss, risk_tier, created_at
-- FROM risk_model_results
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT $2 OFFSET $3;
