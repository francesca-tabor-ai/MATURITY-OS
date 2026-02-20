import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/financial-impact/results — Latest financial impact results */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(_req, organisationId, async (_, orgId) => {
    try {
      const row = await queryOne(
        `SELECT id, revenue_input, profit_margin_input, headcount_input, data_maturity_score, ai_maturity_score,
                revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction,
                industry_benchmark, created_at
         FROM financial_impact_results
         WHERE organisation_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [orgId]
      );
      if (!row) return NextResponse.json({ results: null, message: 'No financial impact result found' });
      return NextResponse.json(row);
    } catch (e) {
      console.error('Financial impact results error:', e);
      return apiError('Failed to retrieve results', 500);
    }
  });
}
