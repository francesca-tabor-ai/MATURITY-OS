/**
 * Platform Infrastructure — Risk Modelling Engine
 * ProbabilityOfFailureService, ExpectedFinancialLossService, RiskModelOrchestrator.
 */

import type {
  ProbabilityOfFailureInputs,
  ProbabilityOfFailureOutput,
  ExpectedFinancialLossInputs,
  ExpectedFinancialLossOutput,
  RiskModelInputs,
  RiskAssessmentReport,
} from './risk-modelling-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Complexity weight: higher complexity → higher base probability */
const COMPLEXITY_BASE: Record<string, number> = {
  low: 0.08,
  medium: 0.22,
  high: 0.45,
};

/**
 * Probability of failure: weighted model with optional Monte Carlo-style uncertainty.
 * Returns probability 0-1 and a confidence interval.
 */
export class ProbabilityOfFailureService {
  calculate(inputs: ProbabilityOfFailureInputs): ProbabilityOfFailureOutput {
    const complexity = inputs.project_complexity ?? 'medium';
    const baseP = COMPLEXITY_BASE[complexity] ?? 0.22;

    const experienceYears = clamp(inputs.team_experience_years ?? 5, 0, 30);
    const experienceFactor = 1 - (experienceYears / 30) * 0.4; // more experience → lower P

    const stability = clamp(inputs.infrastructure_stability_rating ?? 3, 1, 5);
    const stabilityFactor = 0.7 + (5 - stability) * 0.15; // 1→1.5, 5→0.7

    const historical = clamp(inputs.historical_failure_rate ?? 0.2, 0, 1);
    const scopeUncertainty = clamp(inputs.scope_uncertainty ?? 0.3, 0, 1);

    let P = baseP * experienceFactor * stabilityFactor;
    P = P * 0.6 + historical * 0.25 + scopeUncertainty * 0.15;
    P = clamp(P, 0, 1);

    // Simple "confidence interval" based on input completeness and variance
    const spread = 0.05 + (1 - experienceFactor) * 0.08 + scopeUncertainty * 0.07;
    const low = clamp(P - spread, 0, 1);
    const high = clamp(P + spread, 0, 1);

    let risk_tier: 'low' | 'medium' | 'high' = 'medium';
    if (P < 0.25) risk_tier = 'low';
    else if (P >= 0.5) risk_tier = 'high';

    return {
      probability: Math.round(P * 1000) / 1000,
      confidence_interval_low: Math.round(low * 1000) / 1000,
      confidence_interval_high: Math.round(high * 1000) / 1000,
      risk_tier,
    };
  }
}

/**
 * Expected financial loss: E[loss] = P(failure) * impact - mitigation reduces exposure.
 * Supports direct, indirect, reputational impact and sensitivity.
 */
export class ExpectedFinancialLossService {
  calculate(inputs: ExpectedFinancialLossInputs): ExpectedFinancialLossOutput {
    const P = clamp(inputs.probability_of_failure, 0, 1);
    const direct = Math.max(0, inputs.direct_cost_if_failure ?? 0);
    const indirect = Math.max(0, inputs.indirect_cost_if_failure ?? 0);
    const reputational = Math.max(0, inputs.reputational_damage_estimate ?? 0);
    const mitigation = Math.max(0, inputs.mitigation_cost ?? 0);

    const totalImpactIfFailure = direct + indirect + reputational * 0.5; // reputational often partial
    const lossBeforeMitigation = P * totalImpactIfFailure;
    const mitigationBenefit = Math.min(mitigation * 1.2, lossBeforeMitigation * 0.6); // cap benefit
    const expectedLoss = Math.max(0, lossBeforeMitigation - mitigationBenefit);

    const deltaP = totalImpactIfFailure * 0.1;
    const deltaDirect = P * 1;

    return {
      expected_financial_loss: Math.round(expectedLoss * 100) / 100,
      loss_before_mitigation: Math.round(lossBeforeMitigation * 100) / 100,
      sensitivity: {
        delta_probability: Math.round(deltaP * 100) / 100,
        delta_direct_cost: Math.round(deltaDirect * 100) / 100,
      },
    };
  }
}

/**
 * Orchestrator: runs probability then expected loss; aggregates into one report.
 */
export class RiskModelOrchestrator {
  private probabilityService = new ProbabilityOfFailureService();
  private lossService = new ExpectedFinancialLossService();

  run(inputs: RiskModelInputs): RiskAssessmentReport {
    const errors: string[] = [];
    const computedAt = new Date().toISOString();

    let probabilityOutput: ProbabilityOfFailureOutput | null = null;
    let lossOutput: ExpectedFinancialLossOutput | null = null;

    try {
      probabilityOutput = this.probabilityService.calculate(inputs.probability_inputs);
    } catch (e) {
      errors.push(`ProbabilityOfFailure: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    if (probabilityOutput) {
      try {
        lossOutput = this.lossService.calculate({
          probability_of_failure: probabilityOutput.probability,
          direct_cost_if_failure: inputs.loss_inputs.direct_cost_if_failure,
          indirect_cost_if_failure: inputs.loss_inputs.indirect_cost_if_failure,
          reputational_damage_estimate: inputs.loss_inputs.reputational_damage_estimate,
          mitigation_cost: inputs.loss_inputs.mitigation_cost,
        });
      } catch (e) {
        errors.push(`ExpectedFinancialLoss: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    const prob = probabilityOutput ?? {
      probability: 0.5,
      confidence_interval_low: 0.3,
      confidence_interval_high: 0.7,
      risk_tier: 'medium' as const,
    };
    const loss = lossOutput ?? {
      expected_financial_loss: 0,
      loss_before_mitigation: 0,
    };

    return {
      organisation_id: inputs.organisation_id,
      initiative_name: inputs.initiative_name,
      probability_of_failure: prob,
      expected_financial_loss: loss,
      summary: {
        risk_tier: prob.risk_tier,
        expected_loss: loss.expected_financial_loss,
        probability_score: prob.probability,
      },
      computed_at: computedAt,
      ...(errors.length > 0 && { errors }),
    };
  }
}

/** One-shot: run orchestrator and return report */
export function runRiskModel(inputs: RiskModelInputs): RiskAssessmentReport {
  const orchestrator = new RiskModelOrchestrator();
  return orchestrator.run(inputs);
}
