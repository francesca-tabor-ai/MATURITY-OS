import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne, query } from '@/lib/db';
import {
  define_strategic_scenario,
  StrategicDecisionSimulator,
  analyze_simulation_outcomes,
} from '@/lib/strategic-simulation-engine';
import type { ScenarioParameters, SimulationOutcome } from '@/lib/strategic-simulation-types';

/** POST /api/v1/organizations/{org_id}/simulate/strategic-decision — Run strategic decision simulations */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const scenariosInput: { name: string; parameters: ScenarioParameters }[] = Array.isArray(body?.scenarios)
        ? body.scenarios
        : [];
      const save = body?.save === true;

      if (scenariosInput.length === 0) {
        return apiError('Provide scenarios array with at least one item (name, parameters)', 400);
      }

      const [dataRow, aiRow, financialRow] = await Promise.all([
        queryOne<{ maturity_index: number }>(
          'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [orgId]
        ),
        queryOne<{ maturity_score: number }>(
          'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [orgId]
        ),
        queryOne<{ revenue_input: unknown; profit_margin_input: unknown }>(
          'SELECT revenue_input, profit_margin_input FROM financial_impact_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [orgId]
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
        for (const o of outcomes) {
          await query(
            `INSERT INTO strategic_simulations (organisation_id, scenario_name, scenario_parameters, simulated_outcomes, created_by)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              orgId,
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
              session.user.id,
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
      console.error('Strategic decision simulate error:', e);
      return apiError('Simulation failed', 500);
    }
  });
}
