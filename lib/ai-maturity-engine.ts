/**
 * Core Module 0.3: AI Maturity Audit Engine™
 * Rule-based scoring for Automation, AI Usage, and Deployment Maturity.
 * Aggregates to AI Maturity Stage (1–7) and AI Maturity Score (0–100).
 */

import type {
  AutomationInput,
  AIUsageInput,
  DeploymentInput,
  AIAuditInputs,
  CategoryScore,
  AIMaturityOutput,
} from './ai-maturity-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// ---- Automation Maturity ----
export function scoreAutomation(input: AutomationInput = {}): CategoryScore & { raw?: AutomationInput } {
  let score = 0;
  const automatedPct = clamp(input.automated_workflow_pct ?? 0, 0, 100);
  score += automatedPct * 0.35;

  const level: Record<string, number> = {
    none: 0,
    basic: 0.2,
    moderate: 0.5,
    advanced: 0.8,
    full: 1,
  };
  score += (level[input.workflow_automation_level ?? 'none'] ?? 0) * 100 * 0.25;

  if (input.rule_based_automation) score += 15;
  const processes = Math.min(20, input.process_automation_count ?? 0);
  score += (processes / 20) * 100 * 0.15;
  const sophistication = clamp(input.sophistication_rating ?? 3, 1, 5) / 5;
  score += sophistication * 100 * 0.1;

  const totalScore = clamp(score, 0, 100);
  const confidence = 0.5 + 0.5 * (input.workflow_automation_level ? 0.8 : 0.3);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- AI Usage ----
export function scoreAIUsage(input: AIUsageInput = {}): CategoryScore & { raw?: AIUsageInput } {
  const impact: Record<string, number> = { none: 0, pilot: 0.3, departmental: 0.6, enterprise: 1 };
  let score = 0;

  if (input.predictive_models) {
    score += (impact[input.predictive_models_impact ?? 'pilot'] ?? 0) * 25;
  }
  if (input.recommendation_systems) {
    score += (impact[input.recommendation_impact ?? 'pilot'] ?? 0) * 25;
  }
  if (input.nlp_usage) {
    score += (impact[input.nlp_impact ?? 'pilot'] ?? 0) * 25;
  }
  if (input.computer_vision) {
    score += (impact[input.computer_vision_impact ?? 'pilot'] ?? 0) * 25;
  }

  const breadth = clamp(input.ai_breadth_rating ?? 3, 1, 5) / 5;
  const integration = clamp(input.ai_integration_rating ?? 3, 1, 5) / 5;
  score = score * 0.7 + (breadth + integration) * 50 * 0.3;

  const totalScore = clamp(score, 0, 100);
  const techCount = [input.predictive_models, input.recommendation_systems, input.nlp_usage, input.computer_vision].filter(Boolean).length;
  const confidence = 0.5 + 0.5 * Math.min(1, techCount / 4);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- Deployment Maturity ----
export function scoreDeployment(input: DeploymentInput = {}): CategoryScore & { raw?: DeploymentInput } {
  const mode: Record<string, number> = {
    experimental: 0.2,
    pilot: 0.4,
    production: 0.7,
    enterprise_wide: 1,
  };
  const scope: Record<string, number> = {
    isolated: 0.2,
    departmental: 0.4,
    cross_functional: 0.7,
    enterprise_wide: 1,
  };
  const decision: Record<string, number> = {
    human_only: 0,
    human_in_loop: 0.35,
    assisted: 0.65,
    fully_autonomous: 1,
  };

  let score = 0;
  score += (mode[input.deployment_mode ?? 'experimental'] ?? 0) * 100 * 0.35;
  score += (scope[input.scope ?? 'isolated'] ?? 0) * 100 * 0.35;
  score += (decision[input.decision_automation ?? 'human_only'] ?? 0) * 100 * 0.2;

  const workloads = Math.min(10, input.production_workloads_count ?? 0);
  score += (workloads / 10) * 100 * 0.05;
  const scale = clamp(input.scalability_rating ?? 3, 1, 5) / 5;
  const reliability = clamp(input.reliability_rating ?? 3, 1, 5) / 5;
  score += (scale + reliability) * 50 * 0.05;

  const totalScore = clamp(score, 0, 100);
  const confidence = 0.5 + 0.5 * (input.deployment_mode ? 0.7 : 0.3);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

const WEIGHTS = { automation: 0.33, ai_usage: 0.34, deployment: 0.33 } as const;

/** Map maturity score (0–100) to stage 1–7 */
export function scoreToStage(score: number): number {
  if (score < 10) return 1;
  if (score < 25) return 2;
  if (score < 40) return 3;
  if (score < 55) return 4;
  if (score < 70) return 5;
  if (score < 85) return 6;
  return 7;
}

export const STAGE_LABELS: Record<number, string> = {
  1: 'Awareness',
  2: 'Experimenting',
  3: 'Developing',
  4: 'Scaling',
  5: 'Optimising',
  6: 'AI-led',
  7: 'AI-native',
};

export class AIMaturityEngine {
  private inputs: AIAuditInputs;

  constructor(inputs: AIAuditInputs = {}) {
    this.inputs = inputs;
  }

  setInputs(inputs: AIAuditInputs): void {
    this.inputs = { ...this.inputs, ...inputs };
  }

  getCategoryScores(): Omit<AIMaturityOutput, 'maturity_stage' | 'maturity_score'> {
    return {
      automation: scoreAutomation(this.inputs.automation),
      ai_usage: scoreAIUsage(this.inputs.ai_usage),
      deployment: scoreDeployment(this.inputs.deployment),
    };
  }

  calculate(): AIMaturityOutput {
    const cats = this.getCategoryScores();
    const weighted =
      cats.automation.score * WEIGHTS.automation +
      cats.ai_usage.score * WEIGHTS.ai_usage +
      cats.deployment.score * WEIGHTS.deployment;

    const maturityScore = Math.round(clamp(weighted, 0, 100) * 100) / 100;
    const maturityStage = scoreToStage(maturityScore);

    return {
      ...cats,
      maturity_stage: maturityStage,
      maturity_score: maturityScore,
      details: {
        weights: WEIGHTS,
        stage_label: STAGE_LABELS[maturityStage],
      },
    };
  }

  toJSON(): AIMaturityOutput {
    return this.calculate();
  }
}

export function runAIMaturityAudit(inputs: AIAuditInputs): AIMaturityOutput {
  const engine = new AIMaturityEngine(inputs);
  return engine.calculate();
}
