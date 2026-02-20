import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';
import { runRiskModel } from '@/lib/risk-modelling-engine';
import type { RiskModelInputs } from '@/lib/risk-modelling-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * POST /api/v1/organizations/{org_id}/risk-model/calculate
 * Runs the Risk Model Orchestrator (probability of failure + expected financial loss).
 * Returns RiskAssessmentReport; optionally persists to risk_model_results.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async (session, orgId) => {
    try {
      const body = await req.json().catch(() => ({}));

      const complexity = ['low', 'medium', 'high'].includes(body?.probability_inputs?.project_complexity)
        ? body.probability_inputs.project_complexity
        : 'medium';
      const probability_inputs = {
        project_complexity: complexity,
        team_experience_years: body?.probability_inputs?.team_experience_years != null ? Number(body.probability_inputs.team_experience_years) : undefined,
        infrastructure_stability_rating: body?.probability_inputs?.infrastructure_stability_rating != null ? clamp(Number(body.probability_inputs.infrastructure_stability_rating), 1, 5) : undefined,
        historical_failure_rate: body?.probability_inputs?.historical_failure_rate != null ? clamp(Number(body.probability_inputs.historical_failure_rate), 0, 1) : undefined,
        scope_uncertainty: body?.probability_inputs?.scope_uncertainty != null ? clamp(Number(body.probability_inputs.scope_uncertainty), 0, 1) : undefined,
      };

      const loss_inputs = {
        direct_cost_if_failure: body?.loss_inputs?.direct_cost_if_failure != null ? Math.max(0, Number(body.loss_inputs.direct_cost_if_failure)) : undefined,
        indirect_cost_if_failure: body?.loss_inputs?.indirect_cost_if_failure != null ? Math.max(0, Number(body.loss_inputs.indirect_cost_if_failure)) : undefined,
        reputational_damage_estimate: body?.loss_inputs?.reputational_damage_estimate != null ? Math.max(0, Number(body.loss_inputs.reputational_damage_estimate)) : undefined,
        mitigation_cost: body?.loss_inputs?.mitigation_cost != null ? Math.max(0, Number(body.loss_inputs.mitigation_cost)) : undefined,
      };

      const inputs: RiskModelInputs = {
        organisation_id: orgId,
        initiative_name: typeof body?.initiative_name === 'string' ? body.initiative_name : undefined,
        probability_inputs,
        loss_inputs,
      };

      const report = runRiskModel(inputs);
      const persist = body?.persist !== false;

      if (persist) {
        await queryOne(
          `INSERT INTO risk_model_results (
            organisation_id, initiative_name, probability_of_failure,
            confidence_interval_low, confidence_interval_high,
            expected_financial_loss, loss_before_mitigation, risk_tier, details, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            orgId,
            report.initiative_name ?? null,
            report.probability_of_failure.probability,
            report.probability_of_failure.confidence_interval_low,
            report.probability_of_failure.confidence_interval_high,
            report.expected_financial_loss.expected_financial_loss,
            report.expected_financial_loss.loss_before_mitigation ?? null,
            report.summary.risk_tier,
            JSON.stringify({
              probability_of_failure: report.probability_of_failure,
              expected_financial_loss: report.expected_financial_loss,
              summary: report.summary,
              computed_at: report.computed_at,
              ...(report.errors?.length && { errors: report.errors }),
            }),
            session.user.id,
          ]
        );
      }

      return NextResponse.json(report);
    } catch (e) {
      console.error('Risk model calculate error:', e);
      return apiError('Risk model calculation failed', 500);
    }
  });
}
