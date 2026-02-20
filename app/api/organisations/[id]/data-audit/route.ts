import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runDataMaturityAudit } from '@/lib/data-maturity-engine';
import type { AuditInputs } from '@/lib/data-maturity-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: submit audit inputs, run engine, store and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const {
      audit_period,
      collection = {},
      storage = {},
      integration = {},
      governance = {},
      accessibility = {},
    } = body as { audit_period?: string } & AuditInputs;

    const inputs = { collection, storage, integration, governance, accessibility };
    const result = runDataMaturityAudit(inputs);

    const inputRow = await queryOne<{ id: string }>(
      `INSERT INTO data_audit_inputs (organisation_id, audit_period, collection, storage, integration, governance, accessibility, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        organisationId,
        audit_period ?? null,
        JSON.stringify(collection),
        JSON.stringify(storage),
        JSON.stringify(integration),
        JSON.stringify(governance),
        JSON.stringify(accessibility),
        session.user.id,
      ]
    );
    if (!inputRow) return NextResponse.json({ error: 'Failed to save inputs' }, { status: 500 });

    await query(
      `INSERT INTO data_maturity_results (
        audit_input_id, organisation_id,
        collection_score, storage_score, integration_score, governance_score, accessibility_score,
        maturity_stage, confidence_score, maturity_index, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        inputRow.id,
        organisationId,
        result.collection.score,
        result.storage.score,
        result.integration.score,
        result.governance.score,
        result.accessibility.score,
        result.maturity_stage,
        result.confidence_score,
        result.maturity_index,
        JSON.stringify(result.details ?? {}),
      ]
    );

    const resultRow = await queryOne<{ id: string; created_at: string }>(
      'SELECT id, created_at FROM data_maturity_results WHERE audit_input_id = $1 ORDER BY created_at DESC LIMIT 1',
      [inputRow.id]
    );

    return NextResponse.json({
      audit_input_id: inputRow.id,
      result_id: resultRow?.id,
      created_at: resultRow?.created_at,
      ...result,
    });
  } catch (e) {
    console.error('Data audit error:', e);
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
  }
}

/** GET: list data maturity results for this organisation (latest first) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query(
    `SELECT r.id, r.audit_input_id, r.maturity_stage, r.confidence_score, r.maturity_index,
            r.collection_score, r.storage_score, r.integration_score, r.governance_score, r.accessibility_score,
            r.details, r.created_at
     FROM data_maturity_results r
     WHERE r.organisation_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
