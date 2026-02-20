import { NextResponse } from 'next/server';
import { getSession, apiError, checkRateLimit, getRateLimitId } from '@/lib/api-gateway';
import { query } from '@/lib/db';

/**
 * GET /api/v1/investors/{investor_id}/portfolio-summary
 * Aggregated portfolio maturity and financial insights for organisations the investor has access to.
 * Caller must be authenticated and investor_id must match session user (or future: API key for investor).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ investor_id: string }> }
) {
  const session = await getSession(_req);
  if (!session) return apiError('Unauthorized', 401, 'UNAUTHORIZED');

  const { investor_id } = await params;
  if (session.user.id !== investor_id) {
    return apiError('Forbidden', 403, 'FORBIDDEN');
  }

  const { ok, remaining } = checkRateLimit(getRateLimitId(_req, session.user.id));
  if (!ok) return apiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');

  try {
    const orgs = await query<{
      organisation_id: string;
      name: string;
      data_maturity_index: number | null;
      ai_maturity_score: number | null;
      revenue: number | null;
      profit_margin: number | null;
    }>(
      `SELECT o.id AS organisation_id, o.name,
              (SELECT maturity_index FROM data_maturity_results r WHERE r.organisation_id = o.id ORDER BY r.created_at DESC LIMIT 1) AS data_maturity_index,
              (SELECT maturity_score FROM ai_maturity_results r WHERE r.organisation_id = o.id ORDER BY r.created_at DESC LIMIT 1) AS ai_maturity_score,
              (SELECT revenue_input FROM financial_impact_results f WHERE f.organisation_id = o.id ORDER BY f.created_at DESC LIMIT 1) AS revenue,
              (SELECT profit_margin_input FROM financial_impact_results f WHERE f.organisation_id = o.id ORDER BY f.created_at DESC LIMIT 1) AS profit_margin
       FROM user_organisations uo
       JOIN organisations o ON o.id = uo.organisation_id
       WHERE uo.user_id = $1`,
      [investor_id]
    );

    const totalRevenue = orgs.reduce((s, r) => s + (r.revenue != null ? Number(r.revenue) : 0), 0);
    const avgDataMaturity =
      orgs.length > 0
        ? orgs.reduce((s, r) => s + (r.data_maturity_index != null ? Number(r.data_maturity_index) : 0), 0) / orgs.length
        : null;
    const avgAiMaturity =
      orgs.length > 0
        ? orgs.reduce((s, r) => s + (r.ai_maturity_score != null ? Number(r.ai_maturity_score) : 0), 0) / orgs.length
        : null;

    const res = NextResponse.json({
      investor_id,
      organisation_count: orgs.length,
      organisations: orgs.map((o) => ({
        organisation_id: o.organisation_id,
        name: o.name,
        data_maturity_index: o.data_maturity_index != null ? Number(o.data_maturity_index) : null,
        ai_maturity_score: o.ai_maturity_score != null ? Number(o.ai_maturity_score) : null,
        revenue: o.revenue != null ? Number(o.revenue) : null,
        profit_margin_pct: o.profit_margin != null ? Number(o.profit_margin) : null,
      })),
      portfolio_summary: {
        total_revenue: totalRevenue,
        average_data_maturity: avgDataMaturity != null ? Math.round(avgDataMaturity * 100) / 100 : null,
        average_ai_maturity: avgAiMaturity != null ? Math.round(avgAiMaturity * 100) / 100 : null,
      },
    });
    if (remaining < 120) res.headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining - 1)));
    return res;
  } catch (e) {
    console.error('Portfolio summary error:', e);
    return apiError('Failed to retrieve portfolio summary', 500);
  }
}
