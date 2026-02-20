import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/roi-calculator/results — Latest ROI results */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(_req, organisationId, async (_, orgId) => {
    try {
      const row = await queryOne(
        `SELECT id, current_data_maturity, target_data_maturity, current_ai_maturity, target_ai_maturity,
                required_data_investment, required_ai_investment, total_investment,
                expected_roi_pct, expected_roi_multiplier, payback_period_months, payback_period_years,
                created_at
         FROM roi_investment_results
         WHERE organisation_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [orgId]
      );
      if (!row) return NextResponse.json({ results: null, message: 'No ROI result found' });
      return NextResponse.json(row);
    } catch (e) {
      console.error('ROI results error:', e);
      return apiError('Failed to retrieve results', 500);
    }
  });
}
