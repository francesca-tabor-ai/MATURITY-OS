/**
 * Module 5.2: Salesforce Data Connector
 * Connects to Salesforce API for CRM/data governance metrics.
 * Stub implementation; use jsforce or similar in production with OAuth 2.0.
 */

import type { SalesforceConnectionDetails } from './types';
import type { RawConnectorMetrics } from './types';

export class SalesforceConnector {
  private config: SalesforceConnectionDetails;
  private connected = false;

  constructor(config: SalesforceConnectionDetails) {
    this.config = config;
  }

  /** Authenticate (stub: validate instance_url; real impl would use OAuth 2.0 / refresh_token) */
  async connect(): Promise<void> {
    if (!this.config.instance_url) throw new Error('Salesforce: instance_url is required');
    this.connected = true;
  }

  /** List sobjects (stub) */
  async listObjects(): Promise<{ name: string; count?: number }[]> {
    this.ensureConnected();
    return [
      { name: 'Account', count: 5000 },
      { name: 'Opportunity', count: 12000 },
      { name: 'Contact', count: 25000 },
      { name: 'Lead', count: 8000 },
    ];
  }

  /** Query SOQL (stub) */
  async query(_soql: string): Promise<unknown[]> {
    this.ensureConnected();
    return [];
  }

  /** API usage / rate limits (stub) */
  async getApiUsage(): Promise<{ calls24h: number; limit: number }> {
    this.ensureConnected();
    return { calls24h: 4500, limit: 100000 };
  }

  /** Extract metrics for data governance and accessibility */
  async extractMaturityMetrics(): Promise<RawConnectorMetrics> {
    await this.connect();
    const objects = await this.listObjects();
    const usage = await this.getApiUsage();

    return {
      salesforce_objects_count: objects.length,
      salesforce_total_records: objects.reduce((s, o) => s + (o.count ?? 0), 0),
      salesforce_api_calls_24h: usage.calls24h,
    };
  }

  private ensureConnected(): void {
    if (!this.connected) throw new Error('SalesforceConnector: not connected');
  }
}
