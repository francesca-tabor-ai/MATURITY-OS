import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne, query } from '@/lib/db';
import { simulate_investment_impact, compare_investment_scenarios } from '@/lib/investment-simulation-engine';
import type { InvestmentScenarioInput } from '@/lib/investment-simulation-types';

/** POST /api/v1/organizations/{org_id}/simulate/ai-investment — Run AI investment simulations */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const scenarios: InvestmentScenarioInput[] = Array.isArray(body?.scenarios) ? body.scenarios : [];
      const save = body?.save === true;

      if (scenarios.length === 0) {
        return apiError('Provide scenarios array with at least one item', 400);
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

      const currentData = dataRow?.maturity_index ?? 50;
      const currentAi = aiRow?.maturity_score ?? 50;
      const revenue = financialRow?.revenue_input != null ? Number(financialRow.revenue_input) : undefined;
      const marginPct = financialRow?.profit_margin_input != null ? Number(financialRow.profit_margin_input) : undefined;

      const results = scenarios.map((s, i) => {
        const res = simulate_investment_impact(s, currentData, currentAi, {
          revenueForProjection: revenue ?? s.current_revenue,
          marginPct: marginPct ?? s.current_margin_pct,
        });
        res.scenario_index = i;
        return res;
      });
      const comparison = compare_investment_scenarios(results);

      if (save && results.length > 0) {
        for (const r of results) {
          await query(
            `INSERT INTO ai_investment_simulations (
              organisation_id, investment_amount, target_area, time_horizon_years,
              simulated_data_maturity_improvement, simulated_ai_maturity_improvement,
              projected_profit_increase, projected_revenue_increase, details, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              orgId,
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
              session.user.id,
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
      console.error('AI investment simulate error:', e);
      return apiError('Simulation failed', 500);
    }
  });
}
