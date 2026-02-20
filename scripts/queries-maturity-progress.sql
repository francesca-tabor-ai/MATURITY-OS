-- Module 5.3: Maturity Progress Tracking™ – data access

-- 1. Historical maturity over time period (for progress calculation)
-- SELECT snapshot_at, data_maturity_index, ai_maturity_score
-- FROM maturity_snapshots
-- WHERE organisation_id = $1 AND snapshot_at >= $2 AND snapshot_at <= $3
-- ORDER BY snapshot_at ASC;

-- 2. Maturity goals for an organisation
-- SELECT id, organisation_id, goal_type, target_score, target_date, created_at, updated_at
-- FROM maturity_goals
-- WHERE organisation_id = $1
-- ORDER BY goal_type;

-- 3. Current scores vs goals (application layer computes variance)
-- Use getLatestSnapshot + getMaturityGoals; compare in service.
