import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { generate_roadmap } from '@/lib/roadmap-engine';
import type { RoadmapInputs, CapabilityGap, FinancialImpactSummary, TransformationRoadmap } from '@/lib/roadmap-types';

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: generate roadmap from body inputs; store and return */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
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
        organisationId,
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
    console.error('Roadmap generation error:', e);
    return NextResponse.json({ error: 'Roadmap generation failed' }, { status: 500 });
  }
}

/** GET: list roadmaps for this organisation */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query<{
    id: string;
    generation_date: string;
    roadmap: TransformationRoadmap;
    inputs: Record<string, unknown>;
  }>(
    `SELECT id, generation_date, roadmap, inputs
     FROM transformation_roadmaps
     WHERE organisation_id = $1
     ORDER BY generation_date DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
