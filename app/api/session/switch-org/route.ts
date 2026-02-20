import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { organisationId } = body;
  if (!organisationId) return NextResponse.json({ error: 'organisationId required' }, { status: 400 });
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  if (!row) return NextResponse.json({ error: 'Not a member of this organisation' }, { status: 403 });
  return NextResponse.json({ ok: true, activeOrganisationId: organisationId });
}
