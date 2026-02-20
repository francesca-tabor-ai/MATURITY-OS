import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/risk-assessment/results — Latest risk score and level */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(_req, organisationId, async (_, orgId) => {
    try {
      const row = await queryOne(
        `SELECT id, ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score,
                overall_risk_score, risk_level, details, created_at
         FROM risk_assessments
         WHERE organisation_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [orgId]
      );
      if (!row) return NextResponse.json({ results: null, message: 'No risk assessment found' });
      return NextResponse.json(row);
    } catch (e) {
      console.error('Risk assessment results error:', e);
      return apiError('Failed to retrieve results', 500);
    }
  });
}
