import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { token } = body;
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });
  const inv = await queryOne<{ organisation_id: string; role_id: string; email: string }>(
    'SELECT organisation_id, role_id, email FROM invitations WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW()',
    [token]
  );
  if (!inv) return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
  const user = await queryOne<{ email: string }>('SELECT email FROM users WHERE id = $1', [session.user.id]);
  if (user?.email?.toLowerCase() !== inv.email?.toLowerCase()) {
    return NextResponse.json({ error: 'Invitation was sent to a different email' }, { status: 403 });
  }
  await query(
    'INSERT INTO user_organisations (user_id, organisation_id, role_id, is_default) VALUES ($1, $2, $3, FALSE) ON CONFLICT (user_id, organisation_id) DO UPDATE SET role_id = $3',
    [session.user.id, inv.organisation_id, inv.role_id]
  );
  await query('UPDATE invitations SET accepted_at = NOW() WHERE token = $1', [token]);
  return NextResponse.json({ ok: true, organisationId: inv.organisation_id });
}
