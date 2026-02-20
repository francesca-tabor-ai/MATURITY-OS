/**
 * Module 1.3: Risk Assessment Engine™
 * AI misalignment, infrastructure, operational, strategic risk → overall score and LOW/MEDIUM/HIGH.
 */

import type {
  RiskLevel,
  AIMisalignmentInput,
  InfrastructureInput,
  OperationalInput,
  StrategicInput,
  RiskAssessmentInputs,
  CategoryRisk,
  RiskAssessmentOutput,
} from './risk-assessment-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** AI misalignment: low maturity + poor alignment/governance → higher risk */
export function calculateAIMisalignmentRisk(input: AIMisalignmentInput = {}): CategoryRisk {
  const aiScore = clamp(input.ai_maturity_score ?? 50, 0, 100);
  const alignment: Record<string, number> = { low: 80, medium: 45, high: 15 };
  const governance: Record<string, number> = { ad_hoc: 70, defined: 40, governed: 15 };
  let score = (100 - aiScore) * 0.4;
  score += (alignment[input.strategic_goals_alignment ?? 'medium'] ?? 50) * 0.35;
  score += (governance[input.ai_projects_governance ?? 'ad_hoc'] ?? 50) * 0.25;
  if (!input.ai_ethics_framework) score += 10;
  const factors: string[] = [];
  if (aiScore < 40) factors.push('Low AI maturity');
  if (input.strategic_goals_alignment === 'low') factors.push('Goals misalignment');
  if (input.ai_projects_governance === 'ad_hoc') factors.push('Ad-hoc AI governance');
  return { score: clamp(Math.round(score), 0, 100), factors: factors.length ? factors : undefined };
}

/** Infrastructure: on-prem, high complexity, weak security → higher risk */
export function calculateInfrastructureRisk(input: InfrastructureInput = {}): CategoryRisk {
  const cloud: Record<string, number> = { cloud: 20, hybrid: 50, on_premise: 75 };
  const complexity: Record<string, number> = { low: 15, medium: 45, high: 80 };
  const backup: Record<string, number> = { none: 70, basic: 40, tested: 15 };
  let score = (cloud[input.cloud_vs_on_prem ?? 'hybrid'] ?? 50);
  score += (complexity[input.integration_complexity ?? 'medium'] ?? 45) * 0.4;
  const cyber = clamp(input.cybersecurity_rating ?? 3, 1, 5);
  score += (5 - cyber) * 20 * 0.3;
  score += (backup[input.backup_recovery ?? 'basic'] ?? 40) * 0.3;
  const factors: string[] = [];
  if (input.cloud_vs_on_prem === 'on_premise') factors.push('On-premise infrastructure');
  if (input.integration_complexity === 'high') factors.push('High integration complexity');
  if ((input.cybersecurity_rating ?? 5) <= 2) factors.push('Weak cybersecurity posture');
  return { score: clamp(Math.round(score), 0, 100), factors: factors.length ? factors : undefined };
}

/** Operational: weak governance, quality, skills, incident response → higher risk */
export function calculateOperationalRisk(input: OperationalInput = {}): CategoryRisk {
  const gov: Record<string, number> = { none: 75, basic: 45, mature: 15 };
  const incident: Record<string, number> = { none: 70, reactive: 40, proactive: 15 };
  let score = (gov[input.data_governance ?? 'basic'] ?? 45);
  if (!input.data_quality_controls) score += 25;
  const skills = clamp(input.team_skills_rating ?? 3, 1, 5);
  score += (5 - skills) * 15;
  score += (incident[input.incident_response ?? 'reactive'] ?? 40) * 0.4;
  const doc = clamp(input.documentation_rating ?? 3, 1, 5);
  score += (5 - doc) * 8;
  const factors: string[] = [];
  if (input.data_governance === 'none') factors.push('No data governance');
  if (!input.data_quality_controls) factors.push('No data quality controls');
  if ((input.team_skills_rating ?? 5) <= 2) factors.push('Skills gap');
  return { score: clamp(Math.round(score), 0, 100), factors: factors.length ? factors : undefined };
}

/** Strategic: regulatory, competitive, maturity gap → higher risk */
export function calculateStrategicRisk(input: StrategicInput = {}): CategoryRisk {
  const compliance: Record<string, number> = { at_risk: 80, compliant: 40, leading: 15 };
  const competitive: Record<string, number> = { behind: 70, par: 40, ahead: 20 };
  const gap = clamp(input.industry_benchmark_gap ?? 30, 0, 100);
  const maturity = clamp(input.data_ai_maturity_combined ?? 50, 0, 100);
  let score = gap * 0.3;
  score += (compliance[input.regulatory_compliance ?? 'compliant'] ?? 40) * 0.35;
  score += (competitive[input.competitive_data_ai_posture ?? 'par'] ?? 40) * 0.35;
  score += (100 - maturity) * 0.2;
  const factors: string[] = [];
  if (input.regulatory_compliance === 'at_risk') factors.push('Regulatory at risk');
  if (input.competitive_data_ai_posture === 'behind') factors.push('Behind on data/AI');
  return { score: clamp(Math.round(score), 0, 100), factors: factors.length ? factors : undefined };
}

const WEIGHTS = {
  ai_misalignment: 0.25,
  infrastructure: 0.25,
  operational: 0.25,
  strategic: 0.25,
} as const;

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 35) return 'LOW';
  if (score < 65) return 'MEDIUM';
  return 'HIGH';
}

export class RiskAssessmentEngine {
  private inputs: RiskAssessmentInputs;

  constructor(inputs: RiskAssessmentInputs = {}) {
    this.inputs = inputs;
  }

  setInputs(inputs: RiskAssessmentInputs): void {
    this.inputs = { ...this.inputs, ...inputs };
  }

  calculate(): RiskAssessmentOutput {
    const ai = calculateAIMisalignmentRisk(this.inputs.ai_misalignment);
    const infra = calculateInfrastructureRisk(this.inputs.infrastructure);
    const op = calculateOperationalRisk(this.inputs.operational);
    const strat = calculateStrategicRisk(this.inputs.strategic);

    const overall =
      ai.score * WEIGHTS.ai_misalignment +
      infra.score * WEIGHTS.infrastructure +
      op.score * WEIGHTS.operational +
      strat.score * WEIGHTS.strategic;

    const overall_risk_score = Math.round(clamp(overall, 0, 100));
    const risk_level = scoreToRiskLevel(overall_risk_score);

    const summary: string[] = [];
    if (ai.score >= 60) summary.push('AI misalignment risk is elevated');
    if (infra.score >= 60) summary.push('Infrastructure risk is elevated');
    if (op.score >= 60) summary.push('Operational risk is elevated');
    if (strat.score >= 60) summary.push('Strategic risk is elevated');
    if (summary.length === 0) summary.push('No single category is critically elevated');

    return {
      ai_misalignment_risk: ai,
      infrastructure_risk: infra,
      operational_risk: op,
      strategic_risk: strat,
      overall_risk_score,
      risk_level,
      summary,
      details: { weights: WEIGHTS },
    };
  }

  toJSON(): RiskAssessmentOutput {
    return this.calculate();
  }
}

export function runRiskAssessment(inputs: RiskAssessmentInputs): RiskAssessmentOutput {
  const engine = new RiskAssessmentEngine(inputs);
  return engine.calculate();
}
