import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import {
  buildDigitalTwinState,
  EnterpriseDigitalTwin,
  type IntegratedTwinContext,
} from '@/lib/digital-twin-engine';
import type { TwinIntervention, TwinGoal } from '@/lib/digital-twin-types';

async function canAccess(
  session: { user: { id: string } },
  organisationId: string
): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** Load integrated context from DB for the organisation */
async function loadIntegratedContext(
  organisationId: string
): Promise<IntegratedTwinContext> {
  const [dataRow, aiRow, financialRow, riskRow, gapsRow, roadmapRow] =
    await Promise.all([
      queryOne<{ maturity_index: number }>(
        'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{ maturity_score: number }>(
        'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{
        revenue_input: unknown;
        profit_margin_input: unknown;
        details: unknown;
      }>(
        'SELECT revenue_input, profit_margin_input, details FROM financial_impact_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{
        overall_risk_score: number;
        risk_level: string;
        ai_misalignment_risk_score: number;
        infrastructure_risk_score: number;
        operational_risk_score: number;
        strategic_risk_score: number;
      }>(
        'SELECT overall_risk_score, risk_level, ai_misalignment_risk_score, infrastructure_risk_score, operational_risk_score, strategic_risk_score FROM risk_assessments WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
        [organisationId]
      ),
      queryOne<{ gap_count: string; high_priority: string; areas: string[] }>(
        `SELECT COUNT(*)::text AS gap_count,
                COUNT(*) FILTER (WHERE priority_level = 'High')::text AS high_priority,
                COALESCE(ARRAY_AGG(DISTINCT grouped_theme), ARRAY[]::text[]) AS areas
         FROM capability_gaps WHERE organisation_id = $1`,
        [organisationId]
      ),
      queryOne<{ total_initiatives: number; roadmap: unknown }>(
        `SELECT (SELECT COALESCE(SUM(jsonb_array_length(phase->'actions')), 0) FROM jsonb_array_elements(r.roadmap->'phases') AS phase)::int AS total_initiatives, r.roadmap
         FROM transformation_roadmaps r WHERE r.organisation_id = $1 ORDER BY r.generation_date DESC LIMIT 1`,
        [organisationId]
      ),
    ]);

  const revenue =
    financialRow?.revenue_input != null
      ? Number(financialRow.revenue_input)
      : 5_000_000;
  const profitMarginPct =
    financialRow?.profit_margin_input != null
      ? Number(financialRow.profit_margin_input)
      : 10;
  const details =
    financialRow?.details && typeof financialRow.details === 'object'
      ? (financialRow.details as Record<string, unknown>)
      : {};
  const revenueUpside =
    details?.revenue_upside != null ? Number(details.revenue_upside) : undefined;
  const costReduction =
    details?.cost_reduction != null ? Number(details.cost_reduction) : undefined;

  return {
    maturity: {
      data_maturity_index: dataRow?.maturity_index ?? 50,
      ai_maturity_score: aiRow?.maturity_score ?? 50,
    },
    financial: {
      revenue,
      profit_margin_pct: profitMarginPct,
      valuation: revenue * 2.5,
      revenue_upside: revenueUpside,
      cost_reduction: costReduction,
    },
    risk: riskRow
      ? {
          overall_risk_score: riskRow.overall_risk_score,
          risk_level: riskRow.risk_level,
          ai_misalignment_score: riskRow.ai_misalignment_risk_score,
          infrastructure_score: riskRow.infrastructure_risk_score,
          operational_score: riskRow.operational_risk_score,
          strategic_score: riskRow.strategic_risk_score,
        }
      : { overall_risk_score: 50, risk_level: 'medium' },
    capabilities:
      gapsRow?.gap_count != null
        ? {
            gap_count: Number(gapsRow.gap_count) || 0,
            high_priority_count: Number(gapsRow.high_priority) || 0,
            areas: Array.isArray(gapsRow.areas) ? gapsRow.areas : [],
            top_gaps: [],
          }
        : undefined,
    roadmap:
      roadmapRow != null
        ? {
            total_initiatives: Number(roadmapRow.total_initiatives) || 0,
            completed: 0,
            in_progress: 0,
            progress_pct: undefined,
          }
        : undefined,
  };
}

/** GET: current digital twin state (built from integrated modules) */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const context = await loadIntegratedContext(organisationId);
    const state = buildDigitalTwinState(context, { label: 'current' });
    return NextResponse.json({ state });
  } catch (e) {
    console.error('Digital twin GET error:', e);
    return NextResponse.json(
      { error: 'Failed to load digital twin state' },
      { status: 500 }
    );
  }
}

/** POST: simulate future state and/or run optimization; optionally save snapshot */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? 'current';

    const context = await loadIntegratedContext(organisationId);
    const initialState = buildDigitalTwinState(context, { label: 'current' });
    const twin = new EnterpriseDigitalTwin(organisationId, initialState);

    if (action === 'simulate') {
      const future_months = Math.min(
        60,
        Math.max(1, Number(body?.future_months) ?? 12)
      );
      const interventions: TwinIntervention[] = Array.isArray(body?.interventions)
        ? body.interventions.map((i: Record<string, unknown>) => ({
            id: String(i?.id ?? `int-${Math.random().toString(36).slice(2, 8)}`),
            type: (i?.type as TwinIntervention['type']) ?? 'investment',
            target: String(i?.target ?? ''),
            intensity: Math.min(1, Math.max(0, Number(i?.intensity) ?? 0.5)),
            duration_months:
              i?.duration_months != null ? Number(i.duration_months) : undefined,
            description: i?.description as string | undefined,
          }))
        : [];
      const result = twin.simulate_digital_twin_state(
        future_months,
        interventions
      );
      if (body?.save === true) {
        await query(
          `INSERT INTO digital_twin_states (organisation_id, scenario_label, state, created_by)
           VALUES ($1, $2, $3, $4)`,
          [
            organisationId,
            `simulated_${future_months}m`,
            JSON.stringify(result.state),
            session.user.id,
          ]
        );
      }
      return NextResponse.json({
        current_state: initialState,
        simulated: result,
      });
    }

    if (action === 'optimize') {
      const goalInput = body?.goal ?? {};
      const goal: TwinGoal = {
        type:
          [
            'ai_maturity_stage',
            'data_maturity_stage',
            'profit_increase_pct',
            'risk_reduction',
            'revenue_increase_pct',
          ].includes(goalInput?.type) && goalInput.type
            ? goalInput.type
            : 'ai_maturity_stage',
        target_value: Number(goalInput?.target_value ?? 5),
        horizon_months: Math.min(
          48,
          Math.max(6, Number(goalInput?.horizon_months) ?? 12)
        ),
        minimize_risk: Boolean(goalInput?.minimize_risk),
      };
      const plan = twin.optimize_digital_twin_path(goal);
      return NextResponse.json({
        current_state: initialState,
        plan,
      });
    }

    if (action === 'save_snapshot') {
      const label =
        typeof body?.label === 'string' && body.label.trim()
          ? body.label.trim()
          : `snapshot_${new Date().toISOString().slice(0, 10)}`;
      await query(
        `INSERT INTO digital_twin_states (organisation_id, scenario_label, state, created_by)
         VALUES ($1, $2, $3, $4)`,
        [
          organisationId,
          label,
          JSON.stringify(initialState),
          session.user.id,
        ]
      );
      return NextResponse.json({
        state: initialState,
        saved_as: label,
      });
    }

    return NextResponse.json({
      state: initialState,
    });
  } catch (e) {
    console.error('Digital twin POST error:', e);
    return NextResponse.json(
      { error: 'Failed to run digital twin operation' },
      { status: 500 }
    );
  }
}
