import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;
    if (!token || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
    }
    const row = await queryOne<{ identifier: string }>(
      'SELECT identifier FROM verification_tokens WHERE token = $1 AND expires > NOW()',
      [token]
    );
    if (!row) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, row.identifier]);
    await query('DELETE FROM verification_tokens WHERE token = $1', [token]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Reset password error:', e);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
