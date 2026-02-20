import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { RiskScoringService } from '@/lib/scoring-engine';
import type { RiskScoringInput } from '@/lib/scoring-engine-types';

/** POST /api/v1/organizations/{org_id}/scoring/risk — Aggregate risk category scores (optional custom weights) */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async () => {
    try {
      const body = await req.json().catch(() => ({}));
      const input: RiskScoringInput = {};
      if (body?.category_scores && typeof body.category_scores === 'object') {
        input.category_scores = {
          ai_misalignment: Number(body.category_scores.ai_misalignment ?? 0),
          infrastructure: Number(body.category_scores.infrastructure ?? 0),
          operational: Number(body.category_scores.operational ?? 0),
          strategic: Number(body.category_scores.strategic ?? 0),
        };
      }
      if (body?.inputs && typeof body.inputs === 'object') {
        input.inputs = body.inputs;
      }
      if (body?.weights && typeof body.weights === 'object') {
        input.weights = {
          ai_misalignment: body.weights.ai_misalignment != null ? Number(body.weights.ai_misalignment) : undefined,
          infrastructure: body.weights.infrastructure != null ? Number(body.weights.infrastructure) : undefined,
          operational: body.weights.operational != null ? Number(body.weights.operational) : undefined,
          strategic: body.weights.strategic != null ? Number(body.weights.strategic) : undefined,
        };
      }
      if (!input.category_scores && !input.inputs) {
        return apiError('Provide category_scores or inputs', 400);
      }
      const service = new RiskScoringService();
      const result = service.calculate(input);
      return NextResponse.json(result);
    } catch (e) {
      console.error('Risk scoring error:', e);
      return apiError('Risk scoring failed', 500);
    }
  });
}
