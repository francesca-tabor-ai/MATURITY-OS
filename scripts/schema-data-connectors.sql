-- Module 5.2: Automated Data Connectors™
-- Stores connector configurations. Sensitive fields in connection_details should be
-- encrypted at application layer before storage in production.

CREATE TABLE IF NOT EXISTS data_connectors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  connector_type     VARCHAR(30) NOT NULL CHECK (connector_type IN ('snowflake', 'aws', 'salesforce')),
  name                VARCHAR(255) NOT NULL DEFAULT '',
  connection_details  JSONB NOT NULL DEFAULT '{}',
  last_sync_at        TIMESTAMPTZ,
  last_sync_status    VARCHAR(20) CHECK (last_sync_status IN ('ok', 'failed')),
  last_sync_error     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_data_connectors_org ON data_connectors(organisation_id);
CREATE INDEX IF NOT EXISTS idx_data_connectors_type ON data_connectors(connector_type);
CREATE INDEX IF NOT EXISTS idx_data_connectors_last_sync ON data_connectors(organisation_id, last_sync_at DESC);
