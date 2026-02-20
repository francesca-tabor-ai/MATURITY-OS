import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query, queryOne } from '@/lib/db';

const RESET_EXPIRY_HOURS = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, we sent a reset link' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
    await query('DELETE FROM verification_tokens WHERE identifier = $1', [user.id]);
    await query('INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)', [user.id, token, expires]);
    const resetUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    if (process.env.SENDGRID_API_KEY) {
      const sg = await import('@sendgrid/mail');
      sg.default.setApiKey(process.env.SENDGRID_API_KEY);
      await sg.default.send({
        to: email,
        from: (process.env.SENDGRID_FROM_EMAIL as string) || 'noreply@maturityos.com',
        subject: 'MATURITY OS – Password reset',
        text: `Use this link to reset your password: ${resetUrl}. It expires in ${RESET_EXPIRY_HOURS} hour(s).`,
        html: `<p>Use this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>. It expires in ${RESET_EXPIRY_HOURS} hour(s).</p>`,
      });
    } else {
      console.log('[DEV] Password reset link:', resetUrl);
    }
    return NextResponse.json({ message: 'If that email exists, we sent a reset link' });
  } catch (e) {
    console.error('Forgot password error:', e);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
