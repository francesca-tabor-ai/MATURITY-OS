import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { calculate_alignment_score } from '@/lib/scoring-engine';
import type { StrategicObjectivesInput } from '@/lib/scoring-engine-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** POST /api/v1/organizations/{org_id}/scoring/alignment — Calculate Alignment Score (data + AI maturity vs strategy) */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async () => {
    try {
      const body = await req.json().catch(() => ({}));
      const data_maturity_index = clamp(Number(body?.data_maturity_index ?? 0), 0, 100);
      const ai_maturity_score = clamp(Number(body?.ai_maturity_score ?? 0), 0, 100);
      const strategic_objectives: StrategicObjectivesInput | undefined = body?.strategic_objectives
        ? {
            data_strategy_priority: body.strategic_objectives.data_strategy_priority,
            ai_strategy_priority: body.strategic_objectives.ai_strategy_priority,
            target_maturity_timeline: body.strategic_objectives.target_maturity_timeline,
          }
        : undefined;
      const result = calculate_alignment_score(
        data_maturity_index,
        ai_maturity_score,
        strategic_objectives
      );
      return NextResponse.json(result);
    } catch (e) {
      console.error('Alignment scoring error:', e);
      return apiError('Alignment scoring failed', 500);
    }
  });
}
