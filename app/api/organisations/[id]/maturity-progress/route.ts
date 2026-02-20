import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import {
  getMaturityProgressPayload,
  setMaturityGoal,
} from '@/lib/maturity-progress-service';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: progress and goal tracking for the organisation over a time range */
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
    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');
    const now = new Date();
    const defaultTo = now.toISOString().slice(0, 10);
    const defaultFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const from = fromParam?.trim() || defaultFrom;
    const to = toParam?.trim() || defaultTo;

    const payload = await getMaturityProgressPayload(organisationId, from, to);
    return NextResponse.json(payload);
  } catch (e) {
    console.error('Maturity progress GET error:', e);
    return NextResponse.json({ error: 'Failed to load progress data' }, { status: 500 });
  }
}

/** POST: set or update a maturity goal (data or ai) */
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
    const goalType = (body?.goal_type ?? '').toLowerCase();
    if (goalType !== 'data' && goalType !== 'ai') {
      return NextResponse.json({ error: 'goal_type must be "data" or "ai"' }, { status: 400 });
    }
    const targetScore = Number(body?.target_score);
    if (!Number.isFinite(targetScore) || targetScore < 0 || targetScore > 100) {
      return NextResponse.json({ error: 'target_score must be 0–100' }, { status: 400 });
    }
    const targetDate = body?.target_date;
    if (!targetDate || typeof targetDate !== 'string') {
      return NextResponse.json({ error: 'target_date required (YYYY-MM-DD)' }, { status: 400 });
    }

    const goal = await setMaturityGoal(
      organisationId,
      goalType as 'data' | 'ai',
      targetScore,
      targetDate.trim().slice(0, 10),
      session.user.id
    );
    return NextResponse.json({ goal });
  } catch (e) {
    console.error('Maturity progress POST error:', e);
    return NextResponse.json({ error: 'Failed to set goal' }, { status: 500 });
  }
}
