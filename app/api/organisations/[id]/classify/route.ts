import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { classifyMaturity } from '@/lib/maturity-classification-engine';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/**
 * POST: run classification for org. If body has data_maturity_index and ai_maturity_score, use them;
 * otherwise fetch latest from data_maturity_results and ai_maturity_results, then classify and store.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json().catch(() => ({}));
    let dataIndex: number;
    let aiScore: number;
    let dataResultId: string | null = null;
    let aiResultId: string | null = null;

    if (
      typeof body?.data_maturity_index === 'number' &&
      typeof body?.ai_maturity_score === 'number' &&
      body.data_maturity_index >= 0 &&
      body.data_maturity_index <= 100 &&
      body.ai_maturity_score >= 0 &&
      body.ai_maturity_score <= 100
    ) {
      dataIndex = body.data_maturity_index;
      aiScore = body.ai_maturity_score;
    } else {
      const latestData = await queryOne<{ maturity_index: number; id: string }>(
        'SELECT maturity_index AS maturity_index, id FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      );
      const latestAI = await queryOne<{ maturity_score: number; id: string }>(
        'SELECT maturity_score AS maturity_score, id FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      );
      if (!latestData || latestAI == null) {
        return NextResponse.json(
          { error: 'Run at least one Data Maturity and one AI Maturity audit to classify, or send data_maturity_index and ai_maturity_score in the body' },
          { status: 400 }
        );
      }
      dataIndex = Number(latestData.maturity_index);
      aiScore = Number(latestAI.maturity_score);
      dataResultId = latestData.id;
      aiResultId = latestAI.id;
    }

    const result = classifyMaturity(dataIndex, aiScore);

    const row = await queryOne<{ id: string; created_at: string }>(
      `INSERT INTO maturity_classifications (
        organisation_id, data_maturity_index, ai_maturity_score,
        classification_string, matrix_x_coordinate, matrix_y_coordinate,
        risk_classification, opportunity_classification,
        data_audit_result_id, ai_audit_result_id, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at`,
      [
        organisationId,
        dataIndex,
        aiScore,
        result.classification_string,
        result.matrix_x_coordinate,
        result.matrix_y_coordinate,
        result.risk_classification,
        result.opportunity_classification,
        dataResultId,
        aiResultId,
        JSON.stringify(result.details ?? {}),
      ]
    );

    return NextResponse.json({
      id: row?.id,
      created_at: row?.created_at,
      ...result,
    });
  } catch (e) {
    console.error('Classify error:', e);
    return NextResponse.json({ error: 'Classification failed' }, { status: 500 });
  }
}

/** GET: list classification history for this organisation */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query(
    `SELECT id, data_maturity_index, ai_maturity_score, classification_string,
            matrix_x_coordinate, matrix_y_coordinate, risk_classification, opportunity_classification,
            created_at
     FROM maturity_classifications
     WHERE organisation_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
