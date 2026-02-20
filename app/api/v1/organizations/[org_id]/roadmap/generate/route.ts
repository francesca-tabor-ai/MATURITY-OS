import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';
import { generate_roadmap } from '@/lib/roadmap-engine';
import type { RoadmapInputs, CapabilityGap, FinancialImpactSummary } from '@/lib/roadmap-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** POST /api/v1/organizations/{org_id}/roadmap/generate — Generate transformation roadmap */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const current_data_maturity = clamp(Number(body?.current_data_maturity ?? 0), 0, 100);
      const current_ai_maturity = clamp(Number(body?.current_ai_maturity ?? 0), 0, 100);
      const target_data_maturity = clamp(Number(body?.target_data_maturity ?? 100), 0, 100);
      const target_ai_maturity = clamp(Number(body?.target_ai_maturity ?? 100), 0, 100);
      const prioritization = ['highest_roi_first', 'lowest_cost_first', 'strategic_alignment'].includes(
        body?.prioritization
      )
        ? body.prioritization
        : 'strategic_alignment';

      const capability_gaps: CapabilityGap[] = Array.isArray(body?.capability_gaps)
        ? body.capability_gaps.map((g: { id?: string; description?: string; area?: string; priority?: string }) => ({
            id: g?.id,
            description: typeof g?.description === 'string' ? g.description : '',
            area: g?.area,
            priority: g?.priority === 'high' || g?.priority === 'medium' || g?.priority === 'low' ? g.priority : undefined,
          }))
        : [];

      let financial_impact: FinancialImpactSummary | undefined;
      if (body?.financial_impact && typeof body.financial_impact === 'object') {
        const fi = body.financial_impact;
        financial_impact = {
          revenue_upside: fi.revenue_upside != null ? Number(fi.revenue_upside) : undefined,
          profit_margin_expansion_value: fi.profit_margin_expansion_value != null ? Number(fi.profit_margin_expansion_value) : undefined,
          cost_reduction: fi.cost_reduction != null ? Number(fi.cost_reduction) : undefined,
          total_impact: fi.total_impact != null ? Number(fi.total_impact) : undefined,
        };
      }

      const inputs: RoadmapInputs = {
        current_data_maturity,
        current_ai_maturity,
        target_data_maturity,
        target_ai_maturity,
        capability_gaps: capability_gaps.length ? capability_gaps : undefined,
        financial_impact,
        prioritization,
      };
      const roadmap = generate_roadmap(inputs);

      const row = await queryOne<{ id: string; generation_date: string }>(
        `INSERT INTO transformation_roadmaps (organisation_id, inputs, roadmap, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, generation_date`,
        [
          orgId,
          JSON.stringify({
            current_data_maturity,
            current_ai_maturity,
            target_data_maturity,
            target_ai_maturity,
            prioritization,
            capability_gaps: inputs.capability_gaps,
            financial_impact: inputs.financial_impact,
          }),
          JSON.stringify(roadmap),
          session.user.id,
        ]
      );

      return NextResponse.json({
        id: row?.id,
        generation_date: row?.generation_date,
        ...roadmap,
      });
    } catch (e) {
      console.error('Roadmap generate error:', e);
      return apiError('Roadmap generation failed', 500);
    }
  });
}
