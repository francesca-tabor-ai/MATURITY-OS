import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { calculate_valuation_adjustment } from '@/lib/valuation-adjustment-engine';
import type { ValuationInputs } from '@/lib/valuation-adjustment-types';

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: run valuation adjustment; store and return result */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const current_valuation = Math.max(0, Number(body?.current_valuation ?? 0));
    let data_maturity_index = body?.data_maturity_index != null ? clamp(Number(body.data_maturity_index), 0, 100) : null;
    let ai_maturity_score = body?.ai_maturity_score != null ? clamp(Number(body.ai_maturity_score), 0, 100) : null;
    const industry_multiplier = body?.industry_multiplier != null ? Number(body.industry_multiplier) : undefined;

    if (data_maturity_index == null || ai_maturity_score == null) {
      const [dataRow, aiRow] = await Promise.all([
        queryOne<{ maturity_index: number }>(
          'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [organisationId]
        ),
        queryOne<{ maturity_score: number }>(
          'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
          [organisationId]
        ),
      ]);
      data_maturity_index = dataRow?.maturity_index != null ? Number(dataRow.maturity_index) : 50;
      ai_maturity_score = aiRow?.maturity_score != null ? Number(aiRow.maturity_score) : 50;
    }

    const inputs: ValuationInputs = {
      current_valuation,
      data_maturity_index,
      ai_maturity_score,
      industry_multiplier,
    };

    const result = calculate_valuation_adjustment(inputs);

    const row = await queryOne<{ id: string; analysis_date: string }>(
      `INSERT INTO company_valuations (
        organisation_id, current_valuation, data_maturity_index, ai_maturity_score,
        potential_valuation, valuation_upside, valuation_upside_pct, details, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, analysis_date`,
      [
        organisationId,
        result.current_valuation,
        result.data_maturity_index,
        result.ai_maturity_score,
        result.potential_valuation,
        result.valuation_upside,
        result.valuation_upside_pct,
        JSON.stringify({ model_explanation: result.model_explanation }),
        session.user.id,
      ]
    );

    return NextResponse.json({
      id: row?.id,
      analysis_date: row?.analysis_date,
      ...result,
    });
  } catch (e) {
    console.error('Valuation adjustment error:', e);
    return NextResponse.json({ error: 'Valuation calculation failed' }, { status: 500 });
  }
}

/** GET: list history, or preview when current_valuation + maturity params provided */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const currentVal = url.searchParams.get('current_valuation');
  const dataMat = url.searchParams.get('data_maturity_index');
  const aiMat = url.searchParams.get('ai_maturity_score');

  if (currentVal != null && dataMat != null && aiMat != null) {
    const current_valuation = Math.max(0, Number(currentVal));
    const data_maturity_index = clamp(Number(dataMat), 0, 100);
    const ai_maturity_score = clamp(Number(aiMat), 0, 100);
    const result = calculate_valuation_adjustment({
      current_valuation,
      data_maturity_index,
      ai_maturity_score,
    });
    return NextResponse.json(result);
  }

  const rows = await query(
    `SELECT id, analysis_date, current_valuation, data_maturity_index, ai_maturity_score,
            potential_valuation, valuation_upside, valuation_upside_pct
     FROM company_valuations
     WHERE organisation_id = $1
     ORDER BY analysis_date DESC
     LIMIT 50`,
    [organisationId]
  );
  return NextResponse.json(rows);
}
