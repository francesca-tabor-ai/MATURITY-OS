/**
 * Module 5.2: Snowflake Data Connector
 * Connects to Snowflake to extract metrics relevant to data/AI maturity.
 * This module provides a stub implementation; replace with real SDK (e.g. snowflake-connector-python) in production.
 */

import type { SnowflakeConnectionDetails } from './types';
import type { RawConnectorMetrics } from './types';

export class SnowflakeConnector {
  private config: SnowflakeConnectionDetails;
  private connected = false;

  constructor(config: SnowflakeConnectionDetails) {
    this.config = config;
  }

  /** Authenticate (stub: validate config shape; real impl would use service account or OAuth) */
  async connect(): Promise<void> {
    if (!this.config.account || !this.config.username) {
      throw new Error('Snowflake: account and username are required');
    }
    this.connected = true;
  }

  /** List databases (stub: return mock list) */
  async listDatabases(): Promise<string[]> {
    this.ensureConnected();
    return ['MOCK_DB_1', 'MOCK_DB_2'];
  }

  /** List schemas in a database (stub) */
  async listSchemas(_database?: string): Promise<string[]> {
    this.ensureConnected();
    return ['PUBLIC', 'ANALYTICS'];
  }

  /** List tables in a schema (stub) */
  async listTables(_database?: string, _schema?: string): Promise<{ name: string; rowCount?: number }[]> {
    this.ensureConnected();
    return [
      { name: 'CUSTOMERS', rowCount: 10000 },
      { name: 'ORDERS', rowCount: 50000 },
      { name: 'EVENTS', rowCount: 200000 },
    ];
  }

  /** Execute a query (stub: return mock rows based on query hint) */
  async executeQuery(sql: string, _params?: unknown[]): Promise<unknown[]> {
    this.ensureConnected();
    const upper = sql.toUpperCase();
    if (upper.includes('TABLE_SIZE') || upper.includes('INFORMATION_SCHEMA')) {
      return [{ TOTAL_BYTES: 1024 * 1024 * 500, TABLE_COUNT: 12 }];
    }
    if (upper.includes('QUERY_HISTORY')) {
      return [{ QUERY_COUNT: 340 }];
    }
    return [];
  }

  /** Extract metrics for maturity assessment (table sizes, query history, activity) */
  async extractMaturityMetrics(): Promise<RawConnectorMetrics> {
    await this.connect();
    const tables = await this.listTables(this.config.database, this.config.schema);
    const tableCount = tables.length;
    const totalRows = tables.reduce((s, t) => s + (t.rowCount ?? 0), 0);
    const sizeResult = await this.executeQuery(
      "SELECT SUM(BYTES) AS TOTAL_BYTES FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [this.config.schema ?? 'PUBLIC']
    );
    const totalSizeBytes = (sizeResult[0] as { TOTAL_BYTES?: number })?.TOTAL_BYTES ?? totalRows * 200;
    const queryResult = await this.executeQuery("SELECT COUNT(*) AS CNT FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY()) WHERE START_TIME > DATEADD('day', -7, CURRENT_TIMESTAMP())");
    const queryCount7d = (queryResult[0] as { CNT?: number })?.CNT ?? 150;

    return {
      tables_count: tableCount,
      total_size_bytes: totalSizeBytes,
      query_count_7d: queryCount7d,
      active_users: 8,
    };
  }

  disconnect(): void {
    this.connected = false;
  }

  private ensureConnected(): void {
    if (!this.connected) throw new Error('SnowflakeConnector: not connected');
  }
}
