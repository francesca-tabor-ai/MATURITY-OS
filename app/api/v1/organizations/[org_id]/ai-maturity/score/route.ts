import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/ai-maturity/score — Latest AI maturity score and stage */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(_req, organisationId, async (_, orgId) => {
    try {
      const row = await queryOne<{
        maturity_stage: number;
        maturity_score: number;
        automation_score: number;
        ai_usage_score: number;
        deployment_score: number;
        created_at: string;
      }>(
        `SELECT maturity_stage, maturity_score, automation_score, ai_usage_score, deployment_score, created_at
         FROM ai_maturity_results
         WHERE organisation_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [orgId]
      );
      if (!row) return NextResponse.json({ score: null, message: 'No AI maturity result found' });
      return NextResponse.json({
        maturity_stage: row.maturity_stage,
        maturity_score: row.maturity_score,
        category_scores: {
          automation: row.automation_score,
          ai_usage: row.ai_usage_score,
          deployment: row.deployment_score,
        },
        created_at: row.created_at,
      });
    } catch (e) {
      console.error('AI maturity score error:', e);
      return apiError('Failed to retrieve score', 500);
    }
  });
}
