-- Core Module 0.2: Data Maturity reporting queries

-- 1. Historical data maturity scores for an organisation
SELECT maturity_stage, confidence_score, maturity_index,
       collection_score, storage_score, integration_score, governance_score, accessibility_score,
       created_at
FROM data_maturity_results
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC;

-- 2. Compare organisation scores across different audit periods
SELECT i.audit_period,
       r.maturity_stage,
       r.maturity_index,
       r.collection_score,
       r.storage_score,
       r.integration_score,
       r.governance_score,
       r.accessibility_score,
       r.created_at
FROM data_maturity_results r
JOIN data_audit_inputs i ON i.id = r.audit_input_id
WHERE r.organisation_id = :organisation_id
ORDER BY r.created_at DESC;

-- 3. Detailed audit inputs that led to a specific maturity score
SELECT i.id, i.audit_period, i.collection, i.storage, i.integration, i.governance, i.accessibility,
       i.created_at,
       r.maturity_stage, r.maturity_index, r.confidence_score,
       r.collection_score, r.storage_score, r.integration_score, r.governance_score, r.accessibility_score
FROM data_audit_inputs i
JOIN data_maturity_results r ON r.audit_input_id = i.id
WHERE r.id = :result_id;

-- 4. Average maturity scores across all organisations (latest result per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) id, organisation_id, maturity_index,
         collection_score, storage_score, integration_score, governance_score, accessibility_score
  FROM data_maturity_results
  ORDER BY organisation_id, created_at DESC
)
SELECT AVG(maturity_index) AS avg_maturity_index,
       AVG(collection_score) AS avg_collection,
       AVG(storage_score) AS avg_storage,
       AVG(integration_score) AS avg_integration,
       AVG(governance_score) AS avg_governance,
       AVG(accessibility_score) AS avg_accessibility
FROM latest;

-- 5. Organisations with lowest/highest scores in a specific category
-- Lowest collection score (latest result per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, collection_score, o.name
  FROM data_maturity_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, collection_score
FROM latest
WHERE collection_score IS NOT NULL
ORDER BY collection_score ASC
LIMIT 10;

-- Highest maturity index (latest result per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, maturity_index, o.name
  FROM data_maturity_results r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, maturity_index
FROM latest
ORDER BY maturity_index DESC
LIMIT 10;
