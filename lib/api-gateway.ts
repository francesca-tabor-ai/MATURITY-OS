/**
 * Platform Infrastructure — API Layer (v1)
 * Centralized auth, authorization, rate limiting, and error handling for MATURITY OS™ APIs.
 */

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import type { RoleName } from '@/lib/db';

export interface V1Session {
  user: { id: string; email?: string | null; name?: string | null; role?: RoleName };
}

/** Get session (NextAuth). For programmatic access, support Bearer token as session cookie alternative when API keys are implemented. */
export async function getSession(req: Request): Promise<V1Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session as V1Session;
}

/** Check that the authenticated user has access to the organisation (member of user_organisations). */
export async function requireOrgAccess(
  userId: string,
  organisationId: string
): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [userId, organisationId]
  );
  return !!row;
}

/** Optionally enforce role: only allow if session user has one of the allowed roles. */
export async function requireRole(
  userId: string,
  allowedRoles: RoleName[]
): Promise<boolean> {
  const row = await queryOne<{ role_name: RoleName }>(
    `SELECT r.name AS role_name FROM user_organisations uo
     JOIN roles r ON r.id = uo.role_id
     WHERE uo.user_id = $1
     LIMIT 1`,
    [userId]
  );
  if (!row) return false;
  return allowedRoles.includes(row.role_name);
}

/** Standard API error response (JSON). */
export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    { error: message, ...(code && { code }) },
    { status }
  );
}

/** In-memory rate limit: key -> { count, resetAt }. For serverless, consider Upstash Redis for cross-instance limits. */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

export function checkRateLimit(identifier: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(identifier);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(identifier, entry);
  }
  entry.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  return { ok: entry.count <= RATE_LIMIT_MAX, remaining };
}

/** Get client identifier for rate limiting (user id or IP from headers). */
export function getRateLimitId(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') ?? 'unknown';
  return `ip:${ip}`;
}

/**
 * Run a v1 handler with auth and org access. Returns 401/403 or the result of the handler.
 * handler(session, orgId) => Promise<NextResponse>
 */
export async function withV1OrgAuth(
  req: Request,
  orgId: string,
  handler: (session: V1Session, organisationId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getSession(req);
  if (!session) return apiError('Unauthorized', 401, 'UNAUTHORIZED');

  const { ok, remaining } = checkRateLimit(getRateLimitId(req, session.user.id));
  if (!ok) return apiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');

  const hasAccess = await requireOrgAccess(session.user.id, orgId);
  if (!hasAccess) return apiError('Forbidden', 403, 'FORBIDDEN');

  const res = await handler(session, orgId);
  if (remaining < RATE_LIMIT_MAX) {
    res.headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining - 1)));
  }
  return res;
}
