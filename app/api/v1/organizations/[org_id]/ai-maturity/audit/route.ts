import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { query, queryOne } from '@/lib/db';
import { runAIMaturityAudit } from '@/lib/ai-maturity-engine';
import type { AIAuditInputs } from '@/lib/ai-maturity-types';

/** POST /api/v1/organizations/{org_id}/ai-maturity/audit — Submit raw AI audit data and run AI maturity audit */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const { audit_period, automation = {}, ai_usage = {}, deployment = {} } = body as {
        audit_period?: string;
      } & AIAuditInputs;
      const inputs = { automation, ai_usage, deployment };
      const result = runAIMaturityAudit(inputs);

      const inputRow = await queryOne<{ id: string }>(
        `INSERT INTO ai_audit_inputs (organisation_id, audit_period, automation, ai_usage, deployment, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [orgId, audit_period ?? null, JSON.stringify(automation), JSON.stringify(ai_usage), JSON.stringify(deployment), session.user.id]
      );
      if (!inputRow) return apiError('Failed to save inputs', 500);

      await query(
        `INSERT INTO ai_maturity_results (
          audit_input_id, organisation_id,
          automation_score, ai_usage_score, deployment_score,
          maturity_stage, maturity_score, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          inputRow.id,
          orgId,
          result.automation.score,
          result.ai_usage.score,
          result.deployment.score,
          result.maturity_stage,
          result.maturity_score,
          JSON.stringify(result.details ?? {}),
        ]
      );

      const resultRow = await queryOne<{ id: string; created_at: string }>(
        'SELECT id, created_at FROM ai_maturity_results WHERE audit_input_id = $1 ORDER BY created_at DESC LIMIT 1',
        [inputRow.id]
      );

      return NextResponse.json({
        audit_input_id: inputRow.id,
        result_id: resultRow?.id,
        created_at: resultRow?.created_at,
        maturity_stage: result.maturity_stage,
        maturity_score: result.maturity_score,
        details: result.details,
      });
    } catch (e) {
      console.error('AI maturity audit error:', e);
      return apiError('Audit failed', 500);
    }
  });
}
