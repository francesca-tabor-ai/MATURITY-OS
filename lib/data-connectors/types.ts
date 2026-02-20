/**
 * Module 5.2: Automated Data Connectors™ – types
 */

export type ConnectorType = 'snowflake' | 'aws' | 'salesforce';

/** Standardized output for maturity assessment (pipeline → LiveMaturityMonitor) */
export interface StandardMaturityMetrics {
  data_maturity_index: number;
  ai_maturity_score: number;
  metrics: Record<string, unknown>;
  source: string;
}

/** Raw metrics extracted by a connector before transformation */
export interface RawConnectorMetrics {
  tables_count?: number;
  total_size_bytes?: number;
  query_count_7d?: number;
  active_users?: number;
  s3_bucket_count?: number;
  s3_total_objects?: number;
  redshift_tables?: number;
  glue_jobs_count?: number;
  sagemaker_endpoints?: number;
  salesforce_objects_count?: number;
  salesforce_api_calls_24h?: number;
  [key: string]: unknown;
}

/** Stored connector config (connection_details in DB) */
export interface SnowflakeConnectionDetails {
  account: string;
  username: string;
  password?: string;
  warehouse?: string;
  database?: string;
  schema?: string;
  role?: string;
}

export interface AWSConnectionDetails {
  region: string;
  access_key_id?: string;
  secret_access_key?: string;
  s3_buckets?: string[];
  redshift_cluster?: string;
}

export interface SalesforceConnectionDetails {
  instance_url: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  access_token?: string;
}

export type ConnectionDetails =
  | { type: 'snowflake'; snowflake: SnowflakeConnectionDetails }
  | { type: 'aws'; aws: AWSConnectionDetails }
  | { type: 'salesforce'; salesforce: SalesforceConnectionDetails };

export interface DataConnectorRecord {
  id: string;
  organisation_id: string;
  connector_type: ConnectorType;
  name: string;
  connection_details: ConnectionDetails;
  last_sync_at: string | null;
  last_sync_status: 'ok' | 'failed' | null;
  last_sync_error: string | null;
  created_at: string;
  updated_at: string;
}
