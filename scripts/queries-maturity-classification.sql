-- Core Module 0.4: Maturity classification reporting queries

-- 1. Historical maturity classifications for an organisation
SELECT id, data_maturity_index, ai_maturity_score, classification_string,
       matrix_x_coordinate, matrix_y_coordinate, risk_classification, opportunity_classification,
       created_at
FROM maturity_classifications
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC;

-- 2. Track changes in matrix position over time (last 10)
SELECT created_at,
       matrix_x_coordinate AS x,
       matrix_y_coordinate AS y,
       classification_string,
       risk_classification,
       opportunity_classification
FROM maturity_classifications
WHERE organisation_id = :organisation_id
ORDER BY created_at DESC
LIMIT 10;

-- 3. Common classifications across organisations (count by classification_string)
SELECT classification_string, COUNT(*) AS org_count
FROM (
  SELECT DISTINCT ON (organisation_id) organisation_id, classification_string
  FROM maturity_classifications
  ORDER BY organisation_id, created_at DESC
) latest
GROUP BY classification_string
ORDER BY org_count DESC;

-- 4. Organisations with specific risk classification
SELECT mc.organisation_id, o.name, mc.classification_string, mc.risk_classification, mc.created_at
FROM maturity_classifications mc
JOIN organisations o ON o.id = mc.organisation_id
WHERE mc.risk_classification = :risk_classification
  AND mc.id IN (
    SELECT id FROM maturity_classifications m2
    WHERE m2.organisation_id = mc.organisation_id
    ORDER BY created_at DESC LIMIT 1
  );

-- 5. Organisations with specific opportunity classification
SELECT mc.organisation_id, o.name, mc.classification_string, mc.opportunity_classification, mc.created_at
FROM maturity_classifications mc
JOIN organisations o ON o.id = mc.organisation_id
WHERE mc.opportunity_classification = :opportunity_classification
  AND mc.id IN (
    SELECT id FROM maturity_classifications m2
    WHERE m2.organisation_id = mc.organisation_id
    ORDER BY created_at DESC LIMIT 1
  );

-- 6. Latest classification per organisation (for dashboards)
SELECT DISTINCT ON (organisation_id)
  organisation_id, classification_string, matrix_x_coordinate, matrix_y_coordinate,
  risk_classification, opportunity_classification, created_at
FROM maturity_classifications
ORDER BY organisation_id, created_at DESC;
