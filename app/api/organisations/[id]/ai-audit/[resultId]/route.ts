import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: single AI maturity result with audit inputs */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId, resultId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  type ResultRow = {
    id: string;
    audit_input_id: string;
    organisation_id: string;
    maturity_stage: number;
    maturity_score: number;
    automation_score: number | null;
    ai_usage_score: number | null;
    deployment_score: number | null;
    details: Record<string, unknown> | null;
    created_at: string;
  };
  const result = await queryOne<ResultRow>(
    `SELECT r.id, r.audit_input_id, r.organisation_id, r.maturity_stage, r.maturity_score,
            r.automation_score, r.ai_usage_score, r.deployment_score,
            r.details, r.created_at
     FROM ai_maturity_results r
     WHERE r.id = $1 AND r.organisation_id = $2`,
    [resultId, organisationId]
  );
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const inputs = await queryOne(
    `SELECT id, audit_period, automation, ai_usage, deployment, created_at
     FROM ai_audit_inputs WHERE id = $1`,
    [result.audit_input_id]
  );

  return NextResponse.json({ ...result, inputs: inputs ?? null });
}
