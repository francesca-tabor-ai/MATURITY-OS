import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/data-maturity/score — Latest data maturity score, stage, and confidence */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(_req, organisationId, async (_, orgId) => {
    try {
      const row = await queryOne<{
        maturity_stage: number;
        confidence_score: number;
        maturity_index: number;
        collection_score: number;
        storage_score: number;
        integration_score: number;
        governance_score: number;
        accessibility_score: number;
        created_at: string;
      }>(
        `SELECT maturity_stage, confidence_score, maturity_index,
                collection_score, storage_score, integration_score, governance_score, accessibility_score,
                created_at
         FROM data_maturity_results
         WHERE organisation_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [orgId]
      );
      if (!row) return NextResponse.json({ score: null, message: 'No data maturity result found' });
      return NextResponse.json({
        maturity_stage: row.maturity_stage,
        confidence_score: row.confidence_score,
        maturity_index: row.maturity_index,
        category_scores: {
          collection: row.collection_score,
          storage: row.storage_score,
          integration: row.integration_score,
          governance: row.governance_score,
          accessibility: row.accessibility_score,
        },
        created_at: row.created_at,
      });
    } catch (e) {
      console.error('Data maturity score error:', e);
      return apiError('Failed to retrieve score', 500);
    }
  });
}
