-- Module 5.2: Automated Data Connectors™ – monitoring and audit

-- 1. All connectors for an organisation
-- SELECT id, connector_type, name, last_sync_at, last_sync_status, last_sync_error, created_at
-- FROM data_connectors
-- WHERE organisation_id = $1
-- ORDER BY updated_at DESC;

-- 2. Connectors that failed or are out of sync (e.g. no sync in 24h)
-- SELECT id, organisation_id, connector_type, name, last_sync_at, last_sync_status, last_sync_error
-- FROM data_connectors
-- WHERE organisation_id = $1
--   AND (last_sync_status = 'failed' OR last_sync_at IS NULL OR last_sync_at < NOW() - INTERVAL '24 hours')
-- ORDER BY last_sync_at NULLS FIRST;

-- 3. Connector status summary per organisation
-- SELECT organisation_id, connector_type, COUNT(*) AS cnt,
--        MAX(last_sync_at) AS latest_sync
-- FROM data_connectors
-- GROUP BY organisation_id, connector_type;

-- 4. Do not SELECT connection_details in listing APIs; only load when running sync or editing.
-- For audit: who created/updated (join with users if needed).
-- SELECT dc.id, dc.connector_type, dc.name, dc.last_sync_at, u.email AS created_by_email
-- FROM data_connectors dc
-- LEFT JOIN users u ON u.id = dc.created_by
-- WHERE dc.organisation_id = $1;
