/**
 * Module 5.2: AWS Data Connector
 * Connects to AWS (S3, Redshift, Glue, SageMaker) for maturity-relevant metrics.
 * Stub implementation; use AWS SDK in production with IAM/keys.
 */

import type { AWSConnectionDetails } from './types';
import type { RawConnectorMetrics } from './types';

export class AWSConnector {
  private config: AWSConnectionDetails;
  private connected = false;

  constructor(config: AWSConnectionDetails) {
    this.config = config;
  }

  /** Authenticate (stub: validate region) */
  async connect(): Promise<void> {
    if (!this.config.region) throw new Error('AWS: region is required');
    this.connected = true;
  }

  /** S3 bucket metadata (stub) */
  async getS3Metadata(_buckets?: string[]): Promise<{ bucketCount: number; totalObjects: number; totalSizeBytes: number }> {
    this.ensureConnected();
    return {
      bucketCount: this.config.s3_buckets?.length ?? 3,
      totalObjects: 42000,
      totalSizeBytes: 1024 * 1024 * 1024 * 2,
    };
  }

  /** Redshift tables (stub) */
  async getRedshiftTableCount(_cluster?: string): Promise<number> {
    this.ensureConnected();
    return 25;
  }

  /** Glue job runs (stub) */
  async getGlueJobMetrics(): Promise<{ jobsCount: number; runsLast24h: number }> {
    this.ensureConnected();
    return { jobsCount: 6, runsLast24h: 48 };
  }

  /** SageMaker endpoint usage (stub) */
  async getSageMakerMetrics(): Promise<{ endpointCount: number; invocations24h: number }> {
    this.ensureConnected();
    return { endpointCount: 2, invocations24h: 1200 };
  }

  /** Extract all metrics for maturity assessment */
  async extractMaturityMetrics(): Promise<RawConnectorMetrics> {
    await this.connect();
    const s3 = await this.getS3Metadata(this.config.s3_buckets);
    const redshiftTables = await this.getRedshiftTableCount(this.config.redshift_cluster);
    const glue = await this.getGlueJobMetrics();
    const sagemaker = await this.getSageMakerMetrics();

    return {
      s3_bucket_count: s3.bucketCount,
      s3_total_objects: s3.totalObjects,
      total_size_bytes: s3.totalSizeBytes,
      redshift_tables: redshiftTables,
      glue_jobs_count: glue.jobsCount,
      glue_runs_24h: glue.runsLast24h,
      sagemaker_endpoints: sagemaker.endpointCount,
      sagemaker_invocations_24h: sagemaker.invocations24h,
    };
  }

  private ensureConnected(): void {
    if (!this.connected) throw new Error('AWSConnector: not connected');
  }
}
