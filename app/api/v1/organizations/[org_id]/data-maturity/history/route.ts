import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { query } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/data-maturity/history — Historical data maturity scores */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (_, orgId) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
      const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

      const rows = await query<{
        id: string;
        maturity_stage: number;
        confidence_score: number;
        maturity_index: number;
        created_at: string;
      }>(
        `SELECT id, maturity_stage, confidence_score, maturity_index, created_at
         FROM data_maturity_results
         WHERE organisation_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [orgId, limit, offset]
      );
      return NextResponse.json({ items: rows, limit, offset });
    } catch (e) {
      console.error('Data maturity history error:', e);
      return apiError('Failed to retrieve history', 500);
    }
  });
}
