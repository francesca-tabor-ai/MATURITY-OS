-- Platform Infrastructure — API Layer: transaction patterns for API writes
-- Use BEGIN / COMMIT / ROLLBACK for multi-step writes to preserve ACID properties.

-- Example 1: Data maturity audit (insert inputs + insert result atomically)
-- BEGIN;
--   INSERT INTO data_audit_inputs (organisation_id, audit_period, collection, storage, integration, governance, accessibility, created_by)
--   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
--   RETURNING id;
--   -- application uses returned id to insert into data_maturity_results
--   INSERT INTO data_maturity_results (audit_input_id, organisation_id, ...) VALUES (...);
-- COMMIT;
-- On application error: ROLLBACK;

-- Example 2: Financial impact calculate (single insert — optional transaction if you add audit log in same block)
-- BEGIN;
--   INSERT INTO financial_impact_results (...) VALUES (...) RETURNING id, created_at;
-- COMMIT;

-- Example 3: Strategic simulation save (multiple inserts; all or nothing)
-- BEGIN;
--   INSERT INTO strategic_simulations (organisation_id, scenario_name, scenario_parameters, simulated_outcomes, created_by)
--   VALUES ($1, $2, $3, $4, $5);
--   -- repeat for each scenario
-- COMMIT;
-- On error: ROLLBACK;

-- Example 4: Using a transaction in Node/Next.js (lib/db or dedicated client)
-- const client = await pool.connect();
-- try {
--   await client.query('BEGIN');
--   await client.query('INSERT INTO ...', [...]);
--   await client.query('INSERT INTO ...', [...]);
--   await client.query('COMMIT');
-- } catch (e) {
--   await client.query('ROLLBACK');
--   throw e;
-- } finally {
--   client.release();
-- }

-- Note: Current API route handlers use single queryOne/query calls; for multi-insert "save"
-- (e.g. strategic_simulations), each INSERT is independent. To make a single request atomic,
-- use a single client with BEGIN/COMMIT/ROLLBACK as in Example 4.
