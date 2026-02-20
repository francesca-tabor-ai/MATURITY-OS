import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';
import { runROIInvestment } from '@/lib/roi-investment-engine';
import type { ROIInvestmentInputs } from '@/lib/roi-investment-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** POST /api/v1/organizations/{org_id}/roi-calculator/calculate — Calculate ROI and payback period */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));
      const current_data_maturity = clamp(Number(body?.current_data_maturity ?? 0), 0, 100);
      const target_data_maturity = clamp(Number(body?.target_data_maturity ?? 100), 0, 100);
      const current_ai_maturity = clamp(Number(body?.current_ai_maturity ?? 0), 0, 100);
      const target_ai_maturity = clamp(Number(body?.target_ai_maturity ?? 100), 0, 100);
      const estimated_financial_benefits = Math.max(0, Number(body?.estimated_financial_benefits ?? 0));
      const annual_benefits = body?.annual_benefits != null ? Math.max(0, Number(body.annual_benefits)) : undefined;

      if (target_data_maturity < current_data_maturity || target_ai_maturity < current_ai_maturity) {
        return apiError('Target maturity must be >= current', 400);
      }

      const inputs: ROIInvestmentInputs = {
        current_data_maturity,
        target_data_maturity,
        current_ai_maturity,
        target_ai_maturity,
        estimated_financial_benefits,
        annual_benefits,
      };
      const result = runROIInvestment(inputs);
      const annual = annual_benefits ?? estimated_financial_benefits;

      const row = await queryOne<{ id: string; created_at: string }>(
        `INSERT INTO roi_investment_results (
          organisation_id, current_data_maturity, target_data_maturity, current_ai_maturity, target_ai_maturity,
          estimated_financial_benefits, annual_benefits,
          required_data_investment, required_ai_investment, total_investment,
          expected_roi_pct, expected_roi_multiplier, payback_period_months, payback_period_years, details, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, created_at`,
        [
          orgId,
          current_data_maturity,
          target_data_maturity,
          current_ai_maturity,
          target_ai_maturity,
          estimated_financial_benefits,
          annual ?? null,
          result.required_data_investment,
          result.required_ai_investment,
          result.total_investment,
          result.expected_roi_pct,
          result.expected_roi_multiplier,
          result.payback_period_months,
          result.payback_period_years,
          JSON.stringify(result.details ?? {}),
          session.user.id,
        ]
      );

      return NextResponse.json({
        id: row?.id,
        created_at: row?.created_at,
        required_data_investment: result.required_data_investment,
        required_ai_investment: result.required_ai_investment,
        total_investment: result.total_investment,
        expected_roi_pct: result.expected_roi_pct,
        expected_roi_multiplier: result.expected_roi_multiplier,
        payback_period_months: result.payback_period_months,
        payback_period_years: result.payback_period_years,
        details: result.details,
      });
    } catch (e) {
      console.error('ROI calculator error:', e);
      return apiError('Calculation failed', 500);
    }
  });
}
