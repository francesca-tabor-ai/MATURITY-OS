-- Core Module 0.3: AI Maturity reporting queries

-- 1. Historical AI maturity scores for an organisation
SELECT maturity_stage, maturity_score,
       automation_score, ai_usage_score, deployment_score,
       created_at
FROM ai_maturity_results
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC;

-- 2. Compare organisation scores across different audit periods
SELECT i.audit_period,
       r.maturity_stage,
       r.maturity_score,
       r.automation_score,
       r.ai_usage_score,
       r.deployment_score,
       r.created_at
FROM ai_maturity_results r
JOIN ai_audit_inputs i ON i.id = r.audit_input_id
WHERE r.organisation_id = :organisation_id
ORDER BY r.created_at DESC;

-- 3. Detailed audit inputs that led to a specific maturity score
SELECT i.id, i.audit_period, i.automation, i.ai_usage, i.deployment,
       i.created_at,
       r.maturity_stage, r.maturity_score,
       r.automation_score, r.ai_usage_score, r.deployment_score
FROM ai_audit_inputs i
JOIN ai_maturity_results r ON r.audit_input_id = i.id
WHERE r.id = :result_id;

-- 4. Average AI maturity scores across all organisations (latest result per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) id, organisation_id, maturity_score,
         automation_score, ai_usage_score, deployment_score
  FROM ai_maturity_results
  ORDER BY organisation_id, created_at DESC
)
SELECT AVG(maturity_score) AS avg_maturity_score,
       AVG(automation_score) AS avg_automation,
       AVG(ai_usage_score) AS avg_ai_usage,
       AVG(deployment_score) AS avg_deployment
FROM latest;

-- 5. Organisations with lowest/highest AI maturity score (latest result per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, maturity_score, o.name
  FROM ai_maturity_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, maturity_score
FROM latest
ORDER BY maturity_score DESC
LIMIT 10;
