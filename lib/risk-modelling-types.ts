/**
 * Platform Infrastructure — Risk Modelling Engine: types
 * Probability of failure, expected financial loss, orchestrator report.
 */

/** Inputs for probability of failure (data/AI initiative) */
export interface ProbabilityOfFailureInputs {
  project_complexity: 'low' | 'medium' | 'high';
  team_experience_years?: number;
  infrastructure_stability_rating?: number; // 1-5
  historical_failure_rate?: number; // 0-1, e.g. org or industry baseline
  scope_uncertainty?: number; // 0-1
}

/** Output: probability score 0-1 and confidence interval */
export interface ProbabilityOfFailureOutput {
  probability: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  risk_tier: 'low' | 'medium' | 'high';
}

/** Inputs for expected financial loss */
export interface ExpectedFinancialLossInputs {
  probability_of_failure: number;
  direct_cost_if_failure?: number;
  indirect_cost_if_failure?: number;
  reputational_damage_estimate?: number;
  mitigation_cost?: number;
}

/** Output: expected loss (monetary) and sensitivity */
export interface ExpectedFinancialLossOutput {
  expected_financial_loss: number;
  loss_before_mitigation: number;
  sensitivity?: {
    delta_probability?: number; // change in loss per 0.1 increase in P
    delta_direct_cost?: number;
  };
}

/** Full input for the risk model orchestrator */
export interface RiskModelInputs {
  organisation_id: string;
  initiative_name?: string;
  probability_inputs: ProbabilityOfFailureInputs;
  loss_inputs: Omit<ExpectedFinancialLossInputs, 'probability_of_failure'> & {
    direct_cost_if_failure?: number;
    indirect_cost_if_failure?: number;
    reputational_damage_estimate?: number;
    mitigation_cost?: number;
  };
}

/** Aggregated risk assessment report from the orchestrator */
export interface RiskAssessmentReport {
  organisation_id: string;
  initiative_name?: string;
  probability_of_failure: ProbabilityOfFailureOutput;
  expected_financial_loss: ExpectedFinancialLossOutput;
  summary: {
    risk_tier: 'low' | 'medium' | 'high';
    expected_loss: number;
    probability_score: number;
  };
  computed_at: string;
  errors?: string[];
}
