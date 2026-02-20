import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { query, queryOne } from '@/lib/db';
import { runDataMaturityAudit } from '@/lib/data-maturity-engine';
import type { AuditInputs } from '@/lib/data-maturity-types';

/** POST /api/v1/organizations/{org_id}/data-maturity/audit — Submit raw audit data and run data maturity audit */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const {
        audit_period,
        collection = {},
        storage = {},
        integration = {},
        governance = {},
        accessibility = {},
      } = body as { audit_period?: string } & AuditInputs;
      const inputs = { collection, storage, integration, governance, accessibility };
      const result = runDataMaturityAudit(inputs);

      const inputRow = await queryOne<{ id: string }>(
        `INSERT INTO data_audit_inputs (organisation_id, audit_period, collection, storage, integration, governance, accessibility, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          orgId,
          audit_period ?? null,
          JSON.stringify(collection),
          JSON.stringify(storage),
          JSON.stringify(integration),
          JSON.stringify(governance),
          JSON.stringify(accessibility),
          session.user.id,
        ]
      );
      if (!inputRow) return apiError('Failed to save inputs', 500);

      await query(
        `INSERT INTO data_maturity_results (
          audit_input_id, organisation_id,
          collection_score, storage_score, integration_score, governance_score, accessibility_score,
          maturity_stage, confidence_score, maturity_index, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          inputRow.id,
          orgId,
          result.collection.score,
          result.storage.score,
          result.integration.score,
          result.governance.score,
          result.accessibility.score,
          result.maturity_stage,
          result.confidence_score,
          result.maturity_index,
          JSON.stringify(result.details ?? {}),
        ]
      );

      const resultRow = await queryOne<{ id: string; created_at: string }>(
        'SELECT id, created_at FROM data_maturity_results WHERE audit_input_id = $1 ORDER BY created_at DESC LIMIT 1',
        [inputRow.id]
      );

      return NextResponse.json({
        audit_input_id: inputRow.id,
        result_id: resultRow?.id,
        created_at: resultRow?.created_at,
        maturity_stage: result.maturity_stage,
        confidence_score: result.confidence_score,
        maturity_index: result.maturity_index,
        details: result.details,
      });
    } catch (e) {
      console.error('Data maturity audit error:', e);
      return apiError('Audit failed', 500);
    }
  });
}
