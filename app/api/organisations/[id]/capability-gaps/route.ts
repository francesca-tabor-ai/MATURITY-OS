import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runCapabilityGapAnalysis } from '@/lib/capability-gap-engine';
import type {
  CapabilityGapInputs,
  DataMaturitySummary,
  AIMaturitySummary,
} from '@/lib/capability-gap-types';

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

/** POST: run capability gap analysis; store gaps and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();

    const dm = body?.data_maturity ?? {};
    const data_maturity: DataMaturitySummary = {
      maturity_stage: clamp(Number(dm.maturity_stage ?? dm.stage ?? 1), 1, 6),
      maturity_index: clamp(Number(dm.maturity_index ?? 0), 0, 100),
      collection_score: dm.collection_score != null ? Number(dm.collection_score) : undefined,
      storage_score: dm.storage_score != null ? Number(dm.storage_score) : undefined,
      integration_score: dm.integration_score != null ? Number(dm.integration_score) : undefined,
      governance_score: dm.governance_score != null ? Number(dm.governance_score) : undefined,
      accessibility_score: dm.accessibility_score != null ? Number(dm.accessibility_score) : undefined,
    };

    const am = body?.ai_maturity ?? {};
    const ai_maturity: AIMaturitySummary = {
      maturity_stage: clamp(Number(am.maturity_stage ?? am.stage ?? 1), 1, 7),
      maturity_score: clamp(Number(am.maturity_score ?? 0), 0, 100),
      automation_score: am.automation_score != null ? Number(am.automation_score) : undefined,
      ai_usage_score: am.ai_usage_score != null ? Number(am.ai_usage_score) : undefined,
      deployment_score: am.deployment_score != null ? Number(am.deployment_score) : undefined,
    };

    const inputs: CapabilityGapInputs = {
      data_maturity,
      ai_maturity,
      target_data_stage: body?.target_data_stage != null ? clamp(Number(body.target_data_stage), 1, 6) : undefined,
      target_ai_stage: body?.target_ai_stage != null ? clamp(Number(body.target_ai_stage), 1, 7) : undefined,
    };

    const result = runCapabilityGapAnalysis(inputs);
    const analysisDate = new Date().toISOString();

    for (const gap of result.gaps) {
      await queryOne(
        `INSERT INTO capability_gaps (organisation_id, analysis_date, gap_description, priority_level, grouped_theme, dimension, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          organisationId,
          analysisDate,
          gap.description,
          gap.priority_level,
          gap.grouped_theme,
          gap.dimension ?? null,
          session.user.id,
        ]
      );
    }

    return NextResponse.json({
      ...result,
      analysis_date: analysisDate,
    });
  } catch (e) {
    console.error('Capability gap analysis error:', e);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

/** GET: list capability gap rows for this organisation (group by analysis_date on client) */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') ?? '100', 10)));

  const rows = await query<{
    id: string;
    analysis_date: string;
    gap_description: string;
    priority_level: string;
    grouped_theme: string;
    dimension: string | null;
  }>(
    `SELECT id, analysis_date, gap_description, priority_level, grouped_theme, dimension
     FROM capability_gaps
     WHERE organisation_id = $1
     ORDER BY analysis_date DESC, priority_level, gap_description
     LIMIT $2`,
    [organisationId, limit]
  );

  return NextResponse.json(rows);
}
