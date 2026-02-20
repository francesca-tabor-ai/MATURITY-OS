import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { simulate_investment_impact, compare_investment_scenarios } from '@/lib/investment-simulation-engine';
import type { InvestmentScenarioInput, SimulationResult } from '@/lib/investment-simulation-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: return current maturity and optional revenue/margin for prefill (no simulations) */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [dataRow, aiRow, financialRow] = await Promise.all([
      queryOne<{ maturity_index: number }>(
        'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{ maturity_score: number }>(
        'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{ revenue_input: unknown; profit_margin_input: unknown }>(
        'SELECT revenue_input, profit_margin_input FROM financial_impact_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
    ]);

    const currentData = dataRow?.maturity_index ?? 50;
    const currentAi = aiRow?.maturity_score ?? 50;
    const revenue = financialRow?.revenue_input != null ? Number(financialRow.revenue_input) : undefined;
    const marginPct = financialRow?.profit_margin_input != null ? Number(financialRow.profit_margin_input) : undefined;

    return NextResponse.json({
      current_data_maturity: currentData,
      current_ai_maturity: currentAi,
      current_revenue: revenue,
      current_margin_pct: marginPct,
    });
  } catch (e) {
    console.error('Investment simulation GET error:', e);
    return NextResponse.json({ error: 'Failed to load context' }, { status: 500 });
  }
}

/** POST: run simulation(s), optionally compare and save */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json().catch(() => ({}));
    const scenarios: InvestmentScenarioInput[] = Array.isArray(body?.scenarios) ? body.scenarios : [];
    const save = body?.save === true;

    if (scenarios.length === 0) {
      return NextResponse.json({ error: 'Provide scenarios array with at least one item' }, { status: 400 });
    }

    const [dataRow, aiRow, financialRow] = await Promise.all([
      queryOne<{ maturity_index: number }>(
        'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{ maturity_score: number }>(
        'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{ revenue_input: unknown; profit_margin_input: unknown }>(
        'SELECT revenue_input, profit_margin_input FROM financial_impact_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
    ]);

    const currentData = dataRow?.maturity_index ?? 50;
    const currentAi = aiRow?.maturity_score ?? 50;
    const revenue = financialRow?.revenue_input != null ? Number(financialRow.revenue_input) : undefined;
    const marginPct = financialRow?.profit_margin_input != null ? Number(financialRow.profit_margin_input) : undefined;

    const results: SimulationResult[] = scenarios.map((s, i) => {
      const res = simulate_investment_impact(s, currentData, currentAi, {
        revenueForProjection: revenue ?? s.current_revenue,
        marginPct: marginPct ?? s.current_margin_pct,
      });
      res.scenario_index = i;
      return res;
    });

    const comparison = compare_investment_scenarios(results);

    if (save && results.length > 0) {
      const userId = session.user.id;
      for (const r of results) {
        await query(
          `INSERT INTO ai_investment_simulations (
            organisation_id, investment_amount, target_area, time_horizon_years,
            simulated_data_maturity_improvement, simulated_ai_maturity_improvement,
            projected_profit_increase, projected_revenue_increase, details, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            organisationId,
            r.investment_amount,
            r.target_area,
            r.time_horizon_years,
            r.simulated_data_maturity_improvement,
            r.simulated_ai_maturity_improvement,
            r.projected_profit_increase,
            r.projected_revenue_increase,
            JSON.stringify({
              projected_data_maturity: r.projected_data_maturity,
              projected_ai_maturity: r.projected_ai_maturity,
              return_per_unit: r.return_per_unit,
              effective_time_to_benefit_years: r.effective_time_to_benefit_years,
            }),
            userId,
          ]
        );
      }
    }

    return NextResponse.json({
      results,
      comparison,
      context: { current_data_maturity: currentData, current_ai_maturity: currentAi },
    });
  } catch (e) {
    console.error('Investment simulation POST error:', e);
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 });
  }
}
