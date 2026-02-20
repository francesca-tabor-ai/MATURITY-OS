-- Module 2.1: Transformation Roadmap – reporting queries

-- 1. Historical roadmaps for an organisation (newest first)
-- SELECT id, organisation_id, generation_date, roadmap, inputs, created_by
-- FROM transformation_roadmaps
-- WHERE organisation_id = $1
-- ORDER BY generation_date DESC
-- LIMIT 20;

-- 2. Compare two roadmap scenarios by id (e.g. different strategies)
-- SELECT id, generation_date, roadmap->'phases' as phases, jsonb_array_length(roadmap->'phases') as phase_count
-- FROM transformation_roadmaps
-- WHERE id IN ($1, $2);

-- 3. Roadmaps with highest projected total impact (top N)
-- WITH totals AS (
--   SELECT id, organisation_id, generation_date,
--          (SELECT SUM((elem->>'projected_impact_value')::numeric)
--           FROM jsonb_array_elements(roadmap->'phases') elem) AS total_impact
--   FROM transformation_roadmaps
-- )
-- SELECT t.*, o.name AS org_name
-- FROM totals t
-- JOIN organisations o ON o.id = t.organisation_id
-- ORDER BY total_impact DESC NULLS LAST
-- LIMIT 10;

-- 4. Common roadmap action labels across organisations (aggregate from roadmap JSONB)
-- SELECT action->>'description' AS action_desc, COUNT(*) AS org_count
-- FROM transformation_roadmaps,
--      jsonb_array_elements(roadmap->'phases') AS phase,
--      jsonb_array_elements(phase->'actions') AS action
-- GROUP BY action->>'description'
-- ORDER BY org_count DESC
-- LIMIT 20;

-- 5. List roadmaps for an organisation with phase count and total estimated cost
-- SELECT id, generation_date,
--        jsonb_array_length(roadmap->'phases') AS phase_count,
--        roadmap->'total_estimated_cost' AS total_estimated_cost,
--        roadmap->'total_projected_impact' AS total_projected_impact
-- FROM transformation_roadmaps
-- WHERE organisation_id = $1
-- ORDER BY generation_date DESC;
