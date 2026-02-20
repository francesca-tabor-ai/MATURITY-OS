import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const orgs = await query<{ id: string; name: string; slug: string | null; role_name: string; is_default: boolean }>(
    `SELECT o.id, o.name, o.slug, r.name AS role_name, uo.is_default
     FROM user_organisations uo
     JOIN organisations o ON o.id = uo.organisation_id
     JOIN roles r ON r.id = uo.role_id
     WHERE uo.user_id = $1
     ORDER BY uo.is_default DESC, o.name`,
    [session.user.id]
  );
  return NextResponse.json(orgs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, company_size, industry, revenue, geography, employee_count } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Organisation name required' }, { status: 400 });
    }
    const slug = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 100) || 'org';
    const existing = await queryOne<{ id: string }>('SELECT id FROM organisations WHERE slug = $1', [slug]);
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;
    const roleResult = await queryOne<{ id: string }>('SELECT id FROM roles WHERE name = $1', ['Executive']);
    if (!roleResult) return NextResponse.json({ error: 'Roles not found' }, { status: 500 });
    const org = await queryOne<{ id: string; name: string; slug: string }>(
      `INSERT INTO organisations (name, slug, company_size, industry, revenue, geography, employee_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, slug`,
      [name.trim(), finalSlug, company_size ?? null, industry ?? null, revenue ?? null, geography ?? null, employee_count ?? null]
    );
    if (!org) return NextResponse.json({ error: 'Create failed' }, { status: 500 });
    await query(
      'INSERT INTO user_organisations (user_id, organisation_id, role_id, is_default) VALUES ($1, $2, $3, FALSE)',
      [session.user.id, org.id, roleResult.id]
    );
    return NextResponse.json(org);
  } catch (e) {
    console.error('Create organisation error:', e);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
