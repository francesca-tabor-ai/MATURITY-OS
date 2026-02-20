import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runFinancialImpact } from '@/lib/financial-impact-engine';
import { INDUSTRY_BENCHMARKS } from '@/lib/industry-benchmarks';
import type { FinancialImpactInputs } from '@/lib/financial-impact-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: run financial impact with body inputs; store and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const revenue = Number(body?.revenue ?? 0);
    const profit_margin_pct = Number(body?.profit_margin_pct ?? 0);
    const headcount = Math.max(0, Math.floor(Number(body?.headcount ?? 0)));
    const data_maturity_score = clamp(Number(body?.data_maturity_score ?? 0), 0, 100);
    const ai_maturity_score = clamp(Number(body?.ai_maturity_score ?? 0), 0, 100);
    const operational_cost = body?.operational_cost != null ? Number(body.operational_cost) : undefined;
    const industry_benchmark_id = body?.industry_benchmark_id as string | undefined;

    if (revenue < 0 || profit_margin_pct < 0 || profit_margin_pct > 100) {
      return NextResponse.json({ error: 'Invalid revenue or profit margin' }, { status: 400 });
    }

    const benchmark = industry_benchmark_id
      ? INDUSTRY_BENCHMARKS.find((b) => b.id === industry_benchmark_id)
      : INDUSTRY_BENCHMARKS[0];

    const inputs: FinancialImpactInputs = {
      revenue,
      profit_margin_pct,
      headcount,
      operational_cost,
      data_maturity_score,
      ai_maturity_score,
      industry_benchmark: benchmark,
    };

    const result = runFinancialImpact(inputs);

    const row = await queryOne<{ id: string; created_at: string }>(
      `INSERT INTO financial_impact_results (
        organisation_id, revenue_input, profit_margin_input, headcount_input,
        industry_benchmark, data_maturity_score, ai_maturity_score, operational_cost_input,
        revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction, details, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, created_at`,
      [
        organisationId,
        revenue,
        profit_margin_pct,
        headcount,
        benchmark?.name ?? null,
        data_maturity_score,
        ai_maturity_score,
        operational_cost ?? null,
        result.revenue_upside,
        result.profit_margin_expansion_pct,
        result.profit_margin_expansion_value,
        result.cost_reduction,
        JSON.stringify(result.details ?? {}),
        session.user.id,
      ]
    );

    return NextResponse.json({
      id: row?.id,
      created_at: row?.created_at,
      ...result,
    });
  } catch (e) {
    console.error('Financial impact error:', e);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** GET: list financial impact results for this organisation */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query(
    `SELECT id, revenue_input, profit_margin_input, headcount_input, data_maturity_score, ai_maturity_score,
            revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction,
            industry_benchmark, created_at
     FROM financial_impact_results
     WHERE organisation_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
