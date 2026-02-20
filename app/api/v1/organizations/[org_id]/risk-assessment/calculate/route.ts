import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';
import { runRiskAssessment } from '@/lib/risk-assessment-engine';
import type { RiskAssessmentInputs } from '@/lib/risk-assessment-types';

/** POST /api/v1/organizations/{org_id}/risk-assessment/calculate — Submit risk factors and calculate overall risk */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const inputs: RiskAssessmentInputs = {
        ai_misalignment: body?.ai_misalignment ?? {},
        infrastructure: body?.infrastructure ?? {},
        operational: body?.operational ?? {},
        strategic: body?.strategic ?? {},
      };
      const result = runRiskAssessment(inputs);

      const row = await queryOne<{ id: string; created_at: string }>(
        `INSERT INTO risk_assessments (
          organisation_id, ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score,
          overall_risk_score, risk_level, details, inputs, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at`,
        [
          orgId,
          result.ai_misalignment_risk.score,
          result.infrastructure_risk.score,
          result.operational_risk.score,
          result.strategic_risk.score,
          result.overall_risk_score,
          result.risk_level,
          JSON.stringify({ ...result.details, summary: result.summary }),
          JSON.stringify(inputs),
          session.user.id,
        ]
      );

      return NextResponse.json({
        id: row?.id,
        created_at: row?.created_at,
        overall_risk_score: result.overall_risk_score,
        risk_level: result.risk_level,
        ai_misalignment_risk: result.ai_misalignment_risk,
        infrastructure_risk: result.infrastructure_risk,
        operational_risk: result.operational_risk,
        strategic_risk: result.strategic_risk,
        summary: result.summary,
      });
    } catch (e) {
      console.error('Risk assessment error:', e);
      return apiError('Assessment failed', 500);
    }
  });
}
