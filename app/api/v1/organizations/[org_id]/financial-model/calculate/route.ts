import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';
import { runFinancialModel } from '@/lib/financial-modelling-engine';
import { INDUSTRY_BENCHMARKS } from '@/lib/industry-benchmarks';
import type { FinancialModelInputs } from '@/lib/financial-modelling-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * POST /api/v1/organizations/{org_id}/financial-model/calculate
 * Runs the Financial Model Orchestrator (revenue, cost, profit impact services).
 * Returns full FinancialImpactReport; optionally persists to financial_impact_results.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const revenue = Math.max(0, Number(body?.revenue ?? body?.current_revenue ?? 0));
      const profit_margin_pct = clamp(Number(body?.profit_margin_pct ?? 0), 0, 100);
      const headcount = Math.max(0, Math.floor(Number(body?.headcount ?? 0)));
      const data_maturity_index = clamp(Number(body?.data_maturity_index ?? body?.data_maturity_score ?? 0), 0, 100);
      const ai_maturity_score = clamp(Number(body?.ai_maturity_score ?? 0), 0, 100);
      const operational_cost = body?.operational_cost != null ? Number(body.operational_cost) : undefined;
      const industry_growth_rate_pct = body?.industry_growth_rate_pct != null ? Number(body.industry_growth_rate_pct) : undefined;
      const tax_rate_pct = body?.tax_rate_pct != null ? Number(body.tax_rate_pct) : undefined;
      const industry_benchmark_id = body?.industry_benchmark_id as string | undefined;
      const persist = body?.persist !== false;

      const benchmark = industry_benchmark_id
        ? INDUSTRY_BENCHMARKS.find((b) => b.id === industry_benchmark_id)
        : INDUSTRY_BENCHMARKS[0];

      const inputs: FinancialModelInputs = {
        organisation_id: orgId,
        current_revenue: revenue,
        profit_margin_pct,
        headcount,
        operational_cost,
        data_maturity_index,
        ai_maturity_score,
        industry_growth_rate_pct,
        industry_benchmark: benchmark,
        tax_rate_pct,
      };

      const report = runFinancialModel(inputs);

      if (persist) {
        const details = {
          revenue_impact: report.revenue_impact,
          cost_impact: report.cost_impact,
          profit_impact: report.profit_impact,
          summary: report.summary,
          computed_at: report.computed_at,
          ...(report.errors?.length && { errors: report.errors }),
        };
        const marginExpansionValue = revenue > 0 ? report.summary.total_revenue_upside * (profit_margin_pct / 100) : 0;
        await queryOne(
          `INSERT INTO financial_impact_results (
            organisation_id, revenue_input, profit_margin_input, headcount_input,
            industry_benchmark, data_maturity_score, ai_maturity_score, operational_cost_input,
            revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction, details, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            orgId,
            revenue,
            profit_margin_pct,
            headcount,
            benchmark?.name ?? null,
            data_maturity_index,
            ai_maturity_score,
            operational_cost ?? null,
            report.summary.total_revenue_upside,
            null,
            marginExpansionValue,
            report.summary.total_cost_savings,
            JSON.stringify(details),
            session.user.id,
          ]
        );
      }

      return NextResponse.json(report);
    } catch (e) {
      console.error('Financial model calculate error:', e);
      return apiError('Financial model calculation failed', 500);
    }
  });
}
