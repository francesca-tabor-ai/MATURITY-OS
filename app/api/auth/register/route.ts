import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 12);
    const slug = (name || email).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 50) || 'org';
    const orgResult = await queryOne<{ id: string }>(
      `INSERT INTO organisations (name, slug) VALUES ($1, $2) RETURNING id`,
      [name || email, slug]
    );
    if (!orgResult) throw new Error('Failed to create organisation');
    const roleResult = await queryOne<{ id: string }>('SELECT id FROM roles WHERE name = $1', ['Executive']);
    if (!roleResult) throw new Error('Roles not seeded');
    const userResult = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, password_hash, provider) VALUES ($1, $2, $3, 'credentials') RETURNING id`,
      [email.trim().toLowerCase(), name?.trim() || null, hash]
    );
    if (!userResult) throw new Error('Failed to create user');
    await query(
      `INSERT INTO user_organisations (user_id, organisation_id, role_id, is_default) VALUES ($1, $2, $3, TRUE)`,
      [userResult.id, orgResult.id, roleResult.id]
    );
    return NextResponse.json({ ok: true, userId: userResult.id });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
