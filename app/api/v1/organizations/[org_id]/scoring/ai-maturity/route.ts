import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { AIMaturityScoringService } from '@/lib/scoring-engine';
import type { AIMaturityAuditInputs } from '@/lib/scoring-engine-types';

/** POST /api/v1/organizations/{org_id}/scoring/ai-maturity — Calculate AI Maturity Score from raw audit inputs */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async () => {
    try {
      const body = await req.json().catch(() => ({}));
      const inputs: AIMaturityAuditInputs = {
        automation: body?.automation ?? {},
        ai_usage: body?.ai_usage ?? {},
        deployment: body?.deployment ?? {},
      };
      const service = new AIMaturityScoringService();
      const result = service.calculate(inputs);
      return NextResponse.json(result);
    } catch (e) {
      console.error('AI maturity scoring error:', e);
      return apiError('AI maturity scoring failed', 500);
    }
  });
}
