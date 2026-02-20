import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import {
  define_strategic_scenario,
  StrategicDecisionSimulator,
  analyze_simulation_outcomes,
} from '@/lib/strategic-simulation-engine';
import type { ScenarioParameters, SimulationOutcome } from '@/lib/strategic-simulation-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: context for simulation (current maturity, revenue, profit) */
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
    const revenue = financialRow?.revenue_input != null ? Number(financialRow.revenue_input) : 5_000_000;
    const marginPct = financialRow?.profit_margin_input != null ? Number(financialRow.profit_margin_input) : 10;
    const profit = revenue * (marginPct / 100);

    return NextResponse.json({
      current_data_maturity: currentData,
      current_ai_maturity: currentAi,
      current_revenue: revenue,
      current_profit: profit,
      current_valuation: revenue * 2.5,
    });
  } catch (e) {
    console.error('Strategic simulation GET error:', e);
    return NextResponse.json({ error: 'Failed to load context' }, { status: 500 });
  }
}

/** POST: run simulation(s), optionally save and return analysis */
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
    const scenariosInput: { name: string; parameters: ScenarioParameters }[] = Array.isArray(body?.scenarios) ? body.scenarios : [];
    const save = body?.save === true;

    if (scenariosInput.length === 0) {
      return NextResponse.json({ error: 'Provide scenarios array with at least one item (name, parameters)' }, { status: 400 });
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

    const revenue = financialRow?.revenue_input != null ? Number(financialRow.revenue_input) : 5_000_000;
    const marginPct = financialRow?.profit_margin_input != null ? Number(financialRow.profit_margin_input) : 10;
    const profit = revenue * (marginPct / 100);

    const context = {
      current_data_maturity: dataRow?.maturity_index ?? 50,
      current_ai_maturity: aiRow?.maturity_score ?? 50,
      current_revenue: revenue,
      current_profit: profit,
      current_valuation: revenue * 2.5,
    };

    const outcomes: SimulationOutcome[] = [];
    for (const { name, parameters } of scenariosInput) {
      const scenario = define_strategic_scenario(name, parameters);
      const sim = new StrategicDecisionSimulator(scenario, context);
      outcomes.push(sim.run());
    }

    const analysis = analyze_simulation_outcomes(outcomes);

    if (save && outcomes.length > 0) {
      const userId = session.user.id;
      for (const o of outcomes) {
        await query(
          `INSERT INTO strategic_simulations (organisation_id, scenario_name, scenario_parameters, simulated_outcomes, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            organisationId,
            o.scenario_name,
            JSON.stringify(o.parameters),
            JSON.stringify({
              horizon_years: o.horizon_years,
              yearly: o.yearly,
              end_data_maturity: o.end_data_maturity,
              end_ai_maturity: o.end_ai_maturity,
              end_revenue: o.end_revenue,
              end_profit: o.end_profit,
              end_valuation: o.end_valuation,
              end_competitive_score: o.end_competitive_score,
              end_risk_score: o.end_risk_score,
              total_profit_over_horizon: o.total_profit_over_horizon,
              avg_risk_over_horizon: o.avg_risk_over_horizon,
            }),
            userId,
          ]
        );
      }
    }

    return NextResponse.json({
      outcomes,
      analysis,
      context,
    });
  } catch (e) {
    console.error('Strategic simulation POST error:', e);
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 });
  }
}
