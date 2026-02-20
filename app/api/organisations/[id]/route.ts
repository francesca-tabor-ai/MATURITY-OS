import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccess(session, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const org = await queryOne(
    'SELECT id, name, slug, company_size, industry, revenue, geography, employee_count, metadata, created_at, updated_at FROM organisations WHERE id = $1',
    [id]
  );
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(org);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccess(session, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { name, company_size, industry, revenue, geography, employee_count, metadata } = body;
  const org = await queryOne(
    `UPDATE organisations SET
       name = COALESCE($2, name),
       company_size = COALESCE($3, company_size),
       industry = COALESCE($4, industry),
       revenue = COALESCE($5, revenue),
       geography = COALESCE($6, geography),
       employee_count = COALESCE($7, employee_count),
       metadata = COALESCE($8, metadata),
       updated_at = NOW()
     WHERE id = $1 RETURNING id, name, slug, company_size, industry, revenue, geography, employee_count, metadata`,
    [id, name, company_size, industry, revenue, geography, employee_count, metadata ?? undefined]
  );
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(org);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const membership = await queryOne<{ role_name: string }>(
    `SELECT r.name AS role_name FROM user_organisations uo JOIN roles r ON r.id = uo.role_id WHERE uo.user_id = $1 AND uo.organisation_id = $2`,
    [session.user.id, id]
  );
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (membership.role_name !== 'Executive') {
    return NextResponse.json({ error: 'Only Executive can delete organisation' }, { status: 403 });
  }
  await query('DELETE FROM organisations WHERE id = $1', [id]);
  return NextResponse.json({ ok: true });
}
