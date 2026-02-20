import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runAIMaturityAudit } from '@/lib/ai-maturity-engine';
import type { AIAuditInputs } from '@/lib/ai-maturity-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: submit AI audit inputs, run engine, store and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { audit_period, automation = {}, ai_usage = {}, deployment = {} } = body as {
      audit_period?: string;
    } & AIAuditInputs;

    const inputs = { automation, ai_usage, deployment };
    const result = runAIMaturityAudit(inputs);

    const inputRow = await queryOne<{ id: string }>(
      `INSERT INTO ai_audit_inputs (organisation_id, audit_period, automation, ai_usage, deployment, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        organisationId,
        audit_period ?? null,
        JSON.stringify(automation),
        JSON.stringify(ai_usage),
        JSON.stringify(deployment),
        session.user.id,
      ]
    );
    if (!inputRow) return NextResponse.json({ error: 'Failed to save inputs' }, { status: 500 });

    await query(
      `INSERT INTO ai_maturity_results (
        audit_input_id, organisation_id,
        automation_score, ai_usage_score, deployment_score,
        maturity_stage, maturity_score, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        inputRow.id,
        organisationId,
        result.automation.score,
        result.ai_usage.score,
        result.deployment.score,
        result.maturity_stage,
        result.maturity_score,
        JSON.stringify(result.details ?? {}),
      ]
    );

    const resultRow = await queryOne<{ id: string; created_at: string }>(
      'SELECT id, created_at FROM ai_maturity_results WHERE audit_input_id = $1 ORDER BY created_at DESC LIMIT 1',
      [inputRow.id]
    );

    return NextResponse.json({
      audit_input_id: inputRow.id,
      result_id: resultRow?.id,
      created_at: resultRow?.created_at,
      ...result,
    });
  } catch (e) {
    console.error('AI audit error:', e);
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
  }
}

/** GET: list AI maturity results for this organisation (latest first) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query(
    `SELECT r.id, r.audit_input_id, r.maturity_stage, r.maturity_score,
            r.automation_score, r.ai_usage_score, r.deployment_score,
            r.details, r.created_at
     FROM ai_maturity_results r
     WHERE r.organisation_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
