import { NextResponse } from 'next/server';
import { getSession, apiError, checkRateLimit, getRateLimitId } from '@/lib/api-gateway';
import { queryOne, query } from '@/lib/db';

/**
 * GET /api/v1/consultants/{consultant_id}/organization-report/{org_id}
 * Comprehensive report for a specific organisation (maturity, financial, risk, roadmap).
 * Caller must be authenticated and consultant_id must match session; must have access to org_id.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ consultant_id: string; org_id: string }> }
) {
  const session = await getSession(_req);
  if (!session) return apiError('Unauthorized', 401, 'UNAUTHORIZED');

  const { consultant_id, org_id } = await params;
  if (session.user.id !== consultant_id) {
    return apiError('Forbidden', 403, 'FORBIDDEN');
  }

  const hasAccess = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [consultant_id, org_id]
  );
  if (!hasAccess) return apiError('Forbidden', 403, 'FORBIDDEN');

  const { ok, remaining } = checkRateLimit(getRateLimitId(_req, session.user.id));
  if (!ok) return apiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');

  try {
    const [org, dataMaturity, aiMaturity, financial, risk, roadmap] = await Promise.all([
      queryOne<{ name: string; industry: string | null; company_size: string | null }>(
        'SELECT name, industry, company_size FROM organisations WHERE id = $1',
        [org_id]
      ),
      queryOne<{ maturity_stage: number; maturity_index: number; confidence_score: number; created_at: string }>(
        'SELECT maturity_stage, maturity_index, confidence_score, created_at FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [org_id]
      ),
      queryOne<{ maturity_stage: number; maturity_score: number; created_at: string }>(
        'SELECT maturity_stage, maturity_score, created_at FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [org_id]
      ),
      queryOne<{ revenue_input: unknown; profit_margin_input: unknown; revenue_upside: unknown; cost_reduction: unknown; created_at: string }>(
        'SELECT revenue_input, profit_margin_input, revenue_upside, cost_reduction, created_at FROM financial_impact_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [org_id]
      ),
      queryOne<{ overall_risk_score: number; risk_level: string; created_at: string }>(
        'SELECT overall_risk_score, risk_level, created_at FROM risk_assessments WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [org_id]
      ),
      queryOne<{ id: string; generation_date: string; roadmap: { phases?: unknown[] } }>(
        'SELECT id, generation_date, roadmap FROM transformation_roadmaps WHERE organisation_id = $1 ORDER BY generation_date DESC LIMIT 1',
        [org_id]
      ),
    ]);

    if (!org) return apiError('Organisation not found', 404, 'NOT_FOUND');

    const report = {
      organisation_id: org_id,
      organisation_name: org.name,
      industry: org.industry,
      company_size: org.company_size,
      generated_at: new Date().toISOString(),
      data_maturity: dataMaturity
        ? {
            stage: dataMaturity.maturity_stage,
            index: dataMaturity.maturity_index,
            confidence_score: dataMaturity.confidence_score,
            as_of: dataMaturity.created_at,
          }
        : null,
      ai_maturity: aiMaturity
        ? {
            stage: aiMaturity.maturity_stage,
            score: aiMaturity.maturity_score,
            as_of: aiMaturity.created_at,
          }
        : null,
      financial: financial
        ? {
            revenue: financial.revenue_input != null ? Number(financial.revenue_input) : null,
            profit_margin_pct: financial.profit_margin_input != null ? Number(financial.profit_margin_input) : null,
            revenue_upside: financial.revenue_upside != null ? Number(financial.revenue_upside) : null,
            cost_reduction: financial.cost_reduction != null ? Number(financial.cost_reduction) : null,
            as_of: financial.created_at,
          }
        : null,
      risk: risk
        ? {
            overall_score: risk.overall_risk_score,
            level: risk.risk_level,
            as_of: risk.created_at,
          }
        : null,
      roadmap: roadmap
        ? {
            id: roadmap.id,
            generation_date: roadmap.generation_date,
            phases_count: Array.isArray(roadmap.roadmap?.phases) ? roadmap.roadmap.phases.length : 0,
          }
        : null,
    };

    const res = NextResponse.json(report);
    if (remaining < 120) res.headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining - 1)));
    return res;
  } catch (e) {
    console.error('Organization report error:', e);
    return apiError('Failed to generate report', 500);
  }
}
