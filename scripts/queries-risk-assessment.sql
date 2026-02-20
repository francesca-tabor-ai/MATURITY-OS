-- Module 1.3: Risk assessment reporting queries

-- 1. Historical risk assessments for an organisation
SELECT id, ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score,
       overall_risk_score, risk_level, created_at
FROM risk_assessments
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC;

-- 2. Track changes in risk level over time
SELECT created_at, risk_level, overall_risk_score,
       ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score
FROM risk_assessments
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC
LIMIT 20;

-- 3. Common risk patterns (count by risk_level, latest per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, risk_level, overall_risk_score
  FROM risk_assessments
  ORDER BY organisation_id, created_at DESC
)
SELECT risk_level, COUNT(*) AS org_count
FROM latest
GROUP BY risk_level
ORDER BY org_count DESC;

-- 4. Organisations with specific risk level (latest assessment per org)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) id, organisation_id, overall_risk_score, risk_level, created_at
  FROM risk_assessments
  ORDER BY organisation_id, created_at DESC
)
SELECT l.organisation_id, o.name, l.overall_risk_score, l.risk_level, l.created_at
FROM latest l
JOIN organisations o ON o.id = l.organisation_id
WHERE l.risk_level = :risk_level;

-- 5. Organisations with highest risk in a category (e.g. infrastructure)
WITH latest AS (
  SELECT DISTINCT ON (organisation_id) organisation_id, infrastructure_risk_score, o.name
  FROM risk_assessments r
  JOIN organisations o ON o.id = r.organisation_id
  ORDER BY organisation_id, created_at DESC
)
SELECT organisation_id, name, infrastructure_risk_score
FROM latest
ORDER BY infrastructure_risk_score DESC
LIMIT 10;
