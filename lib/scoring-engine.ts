/**
 * Platform Infrastructure — Scoring Engine
 * DataMaturityScoringService, AIMaturityScoringService, calculate_alignment_score, RiskScoringService.
 */

import { runDataMaturityAudit } from './data-maturity-engine';
import { runAIMaturityAudit } from './ai-maturity-engine';
import {
  runRiskAssessment,
  aggregateRiskScores,
} from './risk-assessment-engine';
import type {
  DataMaturityAuditInputs,
  DataMaturityScoreResult,
  AIMaturityAuditInputs,
  AIMaturityScoreResult,
  StrategicObjectivesInput,
  AlignmentScoreResult,
  RiskScoringInput,
  RiskScoreResult,
  RiskCategoryScores,
  RiskWeights,
} from './scoring-engine-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Data Maturity: raw audit inputs → stage, confidence, index. Stateless. */
export class DataMaturityScoringService {
  calculate(inputs: DataMaturityAuditInputs): DataMaturityScoreResult {
    const out = runDataMaturityAudit(inputs);
    return {
      maturity_stage: out.maturity_stage,
      confidence_score: out.confidence_score,
      maturity_index: out.maturity_index,
    };
  }
}

/** AI Maturity: raw audit inputs → stage, score. Stateless. */
export class AIMaturityScoringService {
  calculate(inputs: AIMaturityAuditInputs): AIMaturityScoreResult {
    const out = runAIMaturityAudit(inputs);
    return {
      maturity_stage: out.maturity_stage,
      maturity_score: out.maturity_score,
    };
  }
}

/**
 * Alignment score: how well data and AI capabilities align with strategy.
 * data_maturity_index, ai_maturity_score (0-100); optional strategic_objectives.
 * Returns alignment_score 0-100 and qualitative assessment.
 */
export function calculate_alignment_score(
  data_maturity_index: number,
  ai_maturity_score: number,
  strategic_objectives?: StrategicObjectivesInput
): AlignmentScoreResult {
  const data = clamp(data_maturity_index, 0, 100);
  const ai = clamp(ai_maturity_score, 0, 100);
  const balance = 1 - Math.abs(data - ai) / 100;
  const level = (data + ai) / 200;
  let alignment = balance * 40 + level * 60;
  if (strategic_objectives) {
    const dataP = strategic_objectives.data_strategy_priority === 'high' ? 1.1 : strategic_objectives.data_strategy_priority === 'low' ? 0.9 : 1;
    const aiP = strategic_objectives.ai_strategy_priority === 'high' ? 1.1 : strategic_objectives.ai_strategy_priority === 'low' ? 0.9 : 1;
    alignment = alignment * ((dataP + aiP) / 2);
  }
  alignment = clamp(alignment, 0, 100);
  let assessment: AlignmentScoreResult['assessment'] = 'Needs improvement';
  if (alignment >= 75) assessment = 'Well-aligned';
  else if (alignment >= 55) assessment = 'Moderately aligned';
  else if (alignment < 35) assessment = 'Misaligned';
  return {
    alignment_score: Math.round(alignment * 100) / 100,
    assessment,
  };
}

/** Risk: aggregate category scores with configurable weights → overall score and level. */
export class RiskScoringService {
  calculate(input: RiskScoringInput): RiskScoreResult {
    let category_scores: RiskCategoryScores;
    if (input.category_scores) {
      category_scores = {
        ai_misalignment: clamp(input.category_scores.ai_misalignment, 0, 100),
        infrastructure: clamp(input.category_scores.infrastructure, 0, 100),
        operational: clamp(input.category_scores.operational, 0, 100),
        strategic: clamp(input.category_scores.strategic, 0, 100),
      };
    } else if (input.inputs) {
      const out = runRiskAssessment(input.inputs);
      category_scores = {
        ai_misalignment: out.ai_misalignment_risk.score,
        infrastructure: out.infrastructure_risk.score,
        operational: out.operational_risk.score,
        strategic: out.strategic_risk.score,
      };
    } else {
      throw new Error('RiskScoringService: provide category_scores or inputs');
    }
    const weights: RiskWeights | undefined = input.weights;
    const { overall_risk_score, risk_level } = aggregateRiskScores(category_scores, weights);
    return {
      overall_risk_score,
      risk_level,
      category_scores,
    };
  }
}
