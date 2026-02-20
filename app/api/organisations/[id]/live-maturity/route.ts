import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import {
  getLiveMaturityState,
  recordSnapshot,
  update_maturity_scores_incrementally,
} from '@/lib/live-maturity-service';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: latest snapshot, history, and anomalies for live maturity dashboard */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const url = new URL(req.url);
    const detectAnomalies = url.searchParams.get('detect_anomalies') === '1';
    const limit = Math.min(200, parseInt(url.searchParams.get('limit') ?? '100', 10) || 100);

    const state = await getLiveMaturityState(organisationId, {
      historyLimit: limit,
      detectAndStoreAnomalies: detectAnomalies,
    });

    return NextResponse.json(state);
  } catch (e) {
    console.error('Live maturity GET error:', e);
    return NextResponse.json({ error: 'Failed to load live maturity data' }, { status: 500 });
  }
}

/** POST: record a snapshot, sync from audits, or apply incremental update */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json().catch(() => ({}));

    if (body?.sync_from_audits === true) {
      const [dataRow, aiRow] = await Promise.all([
        queryOne<{ maturity_index: number }>(
          'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [organisationId]
        ),
        queryOne<{ maturity_score: number }>(
          'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [organisationId]
        ),
      ]);
      const dataIdx = dataRow?.maturity_index ?? 0;
      const aiScore = aiRow?.maturity_score ?? 0;
      const snapshot = await recordSnapshot(
        organisationId,
        { data_maturity_index: dataIdx, ai_maturity_score: aiScore, source: 'audit_sync' },
        session.user.id
      );
      return NextResponse.json({ snapshot });
    }

    if (body?.incremental === true && typeof body?.update === 'object') {
      const snapshot = await update_maturity_scores_incrementally(
        organisationId,
        body.update,
        session.user.id
      );
      return NextResponse.json({ snapshot });
    }

    const dataIdx = body?.data_maturity_index != null ? Number(body.data_maturity_index) : null;
    const aiScore = body?.ai_maturity_score != null ? Number(body.ai_maturity_score) : null;
    if (dataIdx == null || aiScore == null) {
      return NextResponse.json(
        { error: 'Provide data_maturity_index and ai_maturity_score, or sync_from_audits: true, or incremental + update' },
        { status: 400 }
      );
    }

    const snapshot = await recordSnapshot(
      organisationId,
      {
        data_maturity_index: dataIdx,
        ai_maturity_score: aiScore,
        metrics: body.metrics ?? {},
        source: body.source ?? 'manual',
      },
      session.user.id
    );
    return NextResponse.json({ snapshot });
  } catch (e) {
    console.error('Live maturity POST error:', e);
    return NextResponse.json({ error: 'Failed to record snapshot' }, { status: 500 });
  }
}
