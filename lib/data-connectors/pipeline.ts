/**
 * Module 5.2: Generic data ingestion pipeline.
 * Config-driven: select connector by type, extract, transform, return standard metrics.
 * Caller (API) pushes to LiveMaturityMonitor (recordSnapshot).
 */

import { SnowflakeConnector } from './snowflake-connector';
import { AWSConnector } from './aws-connector';
import { SalesforceConnector } from './salesforce-connector';
import { transformToStandardMetrics } from './transform';
import type { ConnectionDetails, StandardMaturityMetrics } from './types';

export interface PipelineResult {
  success: boolean;
  metrics?: StandardMaturityMetrics;
  error?: string;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Run the ingestion pipeline for one connector config; returns standardized metrics or error. */
export async function runDataConnectorPipeline(connectionDetails: ConnectionDetails): Promise<PipelineResult> {
  let raw: Record<string, unknown> = {};
  let connectorType: string;

  const run = async (attempt: number): Promise<PipelineResult> => {
    try {
      if (connectionDetails.type === 'snowflake') {
        connectorType = 'snowflake';
        const connector = new SnowflakeConnector(connectionDetails.snowflake);
        raw = (await connector.extractMaturityMetrics()) as Record<string, unknown>;
        connector.disconnect();
      } else if (connectionDetails.type === 'aws') {
        connectorType = 'aws';
        const connector = new AWSConnector(connectionDetails.aws);
        raw = (await connector.extractMaturityMetrics()) as Record<string, unknown>;
      } else if (connectionDetails.type === 'salesforce') {
        connectorType = 'salesforce';
        const connector = new SalesforceConnector(connectionDetails.salesforce);
        raw = (await connector.extractMaturityMetrics()) as Record<string, unknown>;
      } else {
        return { success: false, error: 'Unknown connector type' };
      }

      const metrics = transformToStandardMetrics(raw as import('./types').RawConnectorMetrics, connectorType);
      return { success: true, metrics };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
        return run(attempt + 1);
      }
      return { success: false, error: message };
    }
  };

  return run(0);
}
