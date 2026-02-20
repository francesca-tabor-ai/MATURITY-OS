import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runRiskAssessment } from '@/lib/risk-assessment-engine';
import type { RiskAssessmentInputs } from '@/lib/risk-assessment-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: run risk assessment; store and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
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
        organisationId,
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
      ...result,
    });
  } catch (e) {
    console.error('Risk assessment error:', e);
    return NextResponse.json({ error: 'Assessment failed' }, { status: 500 });
  }
}

/** GET: list risk assessments for this organisation */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query(
    `SELECT id, ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score,
            overall_risk_score, risk_level, details, created_at
     FROM risk_assessments
     WHERE organisation_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
