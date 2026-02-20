/**
 * Platform Infrastructure — Scoring Engine: types
 * Data maturity, AI maturity, alignment, and risk score inputs/outputs.
 */

import type { AuditInputs } from './data-maturity-types';
import type { AIAuditInputs } from './ai-maturity-types';
import type { RiskAssessmentInputs } from './risk-assessment-types';

/** Raw audit inputs for data maturity (Core Module 0.2) */
export type DataMaturityAuditInputs = AuditInputs;

/** Data maturity scoring result */
export interface DataMaturityScoreResult {
  maturity_stage: number;
  confidence_score: number;
  maturity_index: number;
}

/** Raw audit inputs for AI maturity (Core Module 0.3) */
export type AIMaturityAuditInputs = AIAuditInputs;

/** AI maturity scoring result */
export interface AIMaturityScoreResult {
  maturity_stage: number;
  maturity_score: number;
}

/** Strategic objectives (optional for alignment) */
export interface StrategicObjectivesInput {
  data_strategy_priority?: 'low' | 'medium' | 'high';
  ai_strategy_priority?: 'low' | 'medium' | 'high';
  target_maturity_timeline?: string;
}

/** Alignment score result */
export interface AlignmentScoreResult {
  alignment_score: number;
  assessment: 'Well-aligned' | 'Moderately aligned' | 'Needs improvement' | 'Misaligned';
}

/** Risk category scores (0-100 each) for aggregation */
export interface RiskCategoryScores {
  ai_misalignment: number;
  infrastructure: number;
  operational: number;
  strategic: number;
}

/** Configurable weights for risk aggregation (must sum to 1) */
export interface RiskWeights {
  ai_misalignment?: number;
  infrastructure?: number;
  operational?: number;
  strategic?: number;
}

/** Risk scoring result */
export interface RiskScoreResult {
  overall_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  category_scores: RiskCategoryScores;
}

/** Full risk scoring input: either category scores + weights, or full assessment inputs + optional weights */
export interface RiskScoringInput {
  category_scores?: RiskCategoryScores;
  inputs?: RiskAssessmentInputs;
  weights?: RiskWeights;
}
