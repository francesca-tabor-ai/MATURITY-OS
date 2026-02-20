import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runROIInvestment } from '@/lib/roi-investment-engine';
import type { ROIInvestmentInputs } from '@/lib/roi-investment-types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** POST: run ROI/investment calc; store and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const current_data_maturity = clamp(Number(body?.current_data_maturity ?? 0), 0, 100);
    const target_data_maturity = clamp(Number(body?.target_data_maturity ?? 100), 0, 100);
    const current_ai_maturity = clamp(Number(body?.current_ai_maturity ?? 0), 0, 100);
    const target_ai_maturity = clamp(Number(body?.target_ai_maturity ?? 100), 0, 100);
    const estimated_financial_benefits = Math.max(0, Number(body?.estimated_financial_benefits ?? 0));
    const annual_benefits = body?.annual_benefits != null ? Math.max(0, Number(body.annual_benefits)) : undefined;

    if (target_data_maturity < current_data_maturity || target_ai_maturity < current_ai_maturity) {
      return NextResponse.json({ error: 'Target maturity must be >= current' }, { status: 400 });
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
        organisationId,
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
      ...result,
    });
  } catch (e) {
    console.error('ROI investment error:', e);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}

/** GET: list ROI/investment results for this organisation */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await query(
    `SELECT id, current_data_maturity, target_data_maturity, current_ai_maturity, target_ai_maturity,
            estimated_financial_benefits, required_data_investment, required_ai_investment, total_investment,
            expected_roi_pct, expected_roi_multiplier, payback_period_years, payback_period_months, created_at
     FROM roi_investment_results
     WHERE organisation_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
