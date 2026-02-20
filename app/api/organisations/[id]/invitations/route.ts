import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

const INVITE_EXPIRY_DAYS = 7;

async function canManage(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne<{ role_name: string }>(
    `SELECT r.name AS role_name FROM user_organisations uo JOIN roles r ON r.id = uo.role_id WHERE uo.user_id = $1 AND uo.organisation_id = $2`,
    [session.user.id, organisationId]
  );
  return row?.role_name === 'Executive' || row?.role_name === 'Analyst';
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canManage(session, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const list = await query(
    `SELECT i.id, i.email, i.role_id, i.token, i.expires_at, i.created_at, r.name AS role_name
     FROM invitations i JOIN roles r ON r.id = i.role_id
     WHERE i.organisation_id = $1 AND i.accepted_at IS NULL AND i.expires_at > NOW()`,
    [id]
  );
  return NextResponse.json(list);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canManage(session, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const { email, role_id, role } = body;
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    let roleId = role_id;
    if (!roleId && role && typeof role === 'string') {
      const r = await queryOne<{ id: string }>('SELECT id FROM roles WHERE name = $1', [role]);
      roleId = r?.id;
    }
    if (!roleId) {
      const defaultRole = await queryOne<{ id: string }>('SELECT id FROM roles WHERE name = $1', ['Analyst']);
      roleId = defaultRole?.id;
    }
    if (!roleId) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO invitations (organisation_id, email, role_id, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (organisation_id, email) DO UPDATE SET token = $4, role_id = $3, invited_by = $5, expires_at = $6`,
      [id, email.trim().toLowerCase(), roleId, token, session.user.id, expiresAt]
    );
    const inviteUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/invite/accept?token=${token}`;
    if (process.env.SENDGRID_API_KEY) {
      const sg = await import('@sendgrid/mail');
      sg.default.setApiKey(process.env.SENDGRID_API_KEY);
      await sg.default.send({
        to: email,
        from: (process.env.SENDGRID_FROM_EMAIL as string) || 'noreply@maturityos.com',
        subject: 'Invitation to join MATURITY OS',
        text: `You have been invited. Accept here: ${inviteUrl}`,
        html: `<p>You have been invited. <a href="${inviteUrl}">Accept invitation</a>.</p>`,
      });
    } else {
      console.log('[DEV] Invite link:', inviteUrl);
    }
    const inv = await queryOne(
      'SELECT id, email, role_id, token, expires_at, created_at FROM invitations WHERE token = $1',
      [token]
    );
    return NextResponse.json(inv);
  } catch (e) {
    console.error('Invite error:', e);
    return NextResponse.json({ error: 'Invite failed' }, { status: 500 });
  }
}
