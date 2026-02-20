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

/** GET: single data maturity result with audit inputs */
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
    confidence_score: number;
    maturity_index: number;
    collection_score: number | null;
    storage_score: number | null;
    integration_score: number | null;
    governance_score: number | null;
    accessibility_score: number | null;
    details: Record<string, unknown> | null;
    created_at: string;
  };
  const result = await queryOne<ResultRow>(
    `SELECT r.id, r.audit_input_id, r.organisation_id, r.maturity_stage, r.confidence_score, r.maturity_index,
            r.collection_score, r.storage_score, r.integration_score, r.governance_score, r.accessibility_score,
            r.details, r.created_at
     FROM data_maturity_results r
     WHERE r.id = $1 AND r.organisation_id = $2`,
    [resultId, organisationId]
  );
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const inputs = await queryOne(
    `SELECT id, audit_period, collection, storage, integration, governance, accessibility, created_at
     FROM data_audit_inputs WHERE id = $1`,
    [result.audit_input_id]
  );

  return NextResponse.json({ ...result, inputs: inputs ?? null });
}
