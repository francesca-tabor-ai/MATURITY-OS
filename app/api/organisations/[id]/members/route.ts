import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne('SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2', [
    session.user.id,
    organisationId,
  ]);
  return !!row;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccess(session, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const members = await query(
    `SELECT u.id, u.email, u.name, u.image, r.name AS role_name, uo.is_default, uo.created_at
     FROM user_organisations uo
     JOIN users u ON u.id = uo.user_id
     JOIN roles r ON r.id = uo.role_id
     WHERE uo.organisation_id = $1 ORDER BY uo.created_at`,
    [id]
  );
  return NextResponse.json(members);
}
