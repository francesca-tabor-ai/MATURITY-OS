/**
 * Core Module 0.2: Data Maturity Audit Engine™
 * Rule-based scoring for Data Collection, Storage, Integration, Governance, Accessibility.
 * Aggregates to Data Maturity Stage (1–6), Confidence Score (0–1), and Maturity Index (0–100).
 */

import type {
  DataCollectionInput,
  DataStorageInput,
  DataIntegrationInput,
  DataGovernanceInput,
  DataAccessibilityInput,
  AuditInputs,
  CategoryScore,
  DataMaturityOutput,
} from './data-maturity-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const pct = (v: number) => clamp(v, 0, 100);

// ---- Data Collection ----
export function scoreDataCollection(input: DataCollectionInput = {}): CategoryScore & { raw?: DataCollectionInput } {
  let score = 0;
  let weightSum = 0;
  const completeness = typeof input.data_completeness_score === 'number' ? input.data_completeness_score : 50;
  score += pct(completeness) * 0.35;
  weightSum += 0.35;

  const sources = Math.min(10, Math.max(0, input.data_sources_identified ?? 0));
  score += (sources / 10) * 100 * 0.2;
  weightSum += 0.2;

  const structured = (input.structured_data_pct ?? 50) / 100;
  score += structured * 100 * 0.15;
  weightSum += 0.15;

  if (input.automated_collection) {
    score += 100 * 0.15;
  }
  weightSum += 0.15;

  const freq: Record<string, number> = {
    'real-time': 1,
    daily: 0.9,
    weekly: 0.6,
    monthly: 0.4,
    'ad-hoc': 0.2,
    none: 0,
  };
  score += (freq[input.collection_frequency ?? 'none'] ?? 0) * 100 * 0.15;
  weightSum += 0.15;

  const totalScore = weightSum > 0 ? score / weightSum : 0;
  const confidence = 0.5 + 0.5 * Math.min(1, (input.data_sources_identified ?? 0) / 5);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- Data Storage ----
export function scoreDataStorage(input: DataStorageInput = {}): CategoryScore & { raw?: DataStorageInput } {
  let score = 0;
  const types = input.storage_types ?? [];
  const hasWarehouse = types.includes('warehouse') || types.includes('lakehouse') || types.includes('data_lake');
  const hasDb = types.includes('database');
  const hasSheets = types.includes('spreadsheets');
  if (hasWarehouse) score += 40;
  else if (hasDb) score += 25;
  if (hasSheets && !hasDb && !hasWarehouse) score += 10;
  else if (hasSheets) score += 5;

  const cloud: Record<string, number> = { cloud: 1, hybrid: 0.7, 'on-premise': 0.4 };
  score += (cloud[input.cloud_vs_on_prem ?? 'on-premise'] ?? 0) * 25;

  if (input.real_time_processing) score += 15;
  else if (input.batch_processing) score += 8;

  const scale = clamp(input.scalability_rating ?? 3, 1, 5) / 5;
  const security = clamp(input.security_rating ?? 3, 1, 5) / 5;
  const access = clamp(input.accessibility_rating ?? 3, 1, 5) / 5;
  score += (scale + security + access) * (100 - score) * 0.4;

  const totalScore = clamp(score, 0, 100);
  const confidence = 0.5 + 0.5 * (types.length > 0 ? Math.min(1, types.length / 3) : 0.3);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- Data Integration ----
export function scoreDataIntegration(input: DataIntegrationInput = {}): CategoryScore & { raw?: DataIntegrationInput } {
  let score = 0;
  const systems = Math.min(20, input.integrated_systems_count ?? 0);
  score += (systems / 20) * 30;

  if (input.api_available) score += 25;

  const pipeline: Record<string, number> = {
    none: 0,
    manual: 0.2,
    'semi-automated': 0.6,
    'fully-automated': 1,
  };
  score += (pipeline[input.pipeline_maturity ?? 'none'] ?? 0) * 25;

  if (input.etl_elt_process) score += 10;
  if (input.data_quality_checks) score += 10;
  if (input.real_time_sync) score += 5;

  const totalScore = clamp(score, 0, 100);
  const confidence = 0.5 + 0.5 * (input.api_available ? 0.8 : 0.3);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- Data Governance ----
export function scoreDataGovernance(input: DataGovernanceInput = {}): CategoryScore & { raw?: DataGovernanceInput } {
  let score = 0;
  if (input.data_ownership_defined) score += 20;
  if (input.data_quality_controls) score += 20;
  const meta: Record<string, number> = { none: 0, basic: 0.25, standard: 0.6, advanced: 1 };
  score += (meta[input.metadata_management ?? 'none'] ?? 0) * 25;
  if (input.policies_documented) score += 20;
  if (input.compliance_framework) score += 10;
  if (input.data_catalog) score += 5;

  const totalScore = clamp(score, 0, 100);
  const confidence = 0.5 + 0.5 * (input.policies_documented ? 0.7 : 0.3);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- Data Accessibility ----
export function scoreDataAccessibility(input: DataAccessibilityInput = {}): CategoryScore & { raw?: DataAccessibilityInput } {
  let score = 0;
  if (input.self_service_analytics) score += 25;
  if (input.real_time_data_access) score += 20;
  if (input.cross_functional_access) score += 20;
  if (input.role_based_access) score += 15;
  const accessRating = clamp(input.access_rating ?? 3, 1, 5) / 5;
  score += accessRating * 20;

  const tools = input.reporting_tools ?? [];
  if (tools.includes('embedded') || tools.includes('bi_tools')) score = Math.min(100, score + 10);
  else if (tools.includes('spreadsheets')) score = Math.min(100, score + 5);

  const totalScore = clamp(score, 0, 100);
  const confidence = 0.5 + 0.5 * (input.role_based_access ? 0.6 : 0.3);
  return { score: Math.round(totalScore * 100) / 100, confidence: clamp(confidence, 0, 1), raw: input };
}

// ---- Weights for overall index (sum = 1) ----
const WEIGHTS = {
  collection: 0.2,
  storage: 0.2,
  integration: 0.2,
  governance: 0.2,
  accessibility: 0.2,
} as const;

/** Map maturity index (0–100) to stage 1–6 */
export function indexToStage(index: number): number {
  if (index < 15) return 1;
  if (index < 35) return 2;
  if (index < 55) return 3;
  if (index < 75) return 4;
  if (index < 90) return 5;
  return 6;
}

export const STAGE_LABELS: Record<number, string> = {
  1: 'Initial / Ad-hoc',
  2: 'Developing',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimising',
  6: 'Data-driven',
};

export class DataMaturityEngine {
  private inputs: AuditInputs;

  constructor(inputs: AuditInputs = {}) {
    this.inputs = inputs;
  }

  setInputs(inputs: AuditInputs): void {
    this.inputs = { ...this.inputs, ...inputs };
  }

  getCategoryScores(): Omit<DataMaturityOutput, 'maturity_stage' | 'confidence_score' | 'maturity_index'> {
    return {
      collection: scoreDataCollection(this.inputs.collection),
      storage: scoreDataStorage(this.inputs.storage),
      integration: scoreDataIntegration(this.inputs.integration),
      governance: scoreDataGovernance(this.inputs.governance),
      accessibility: scoreDataAccessibility(this.inputs.accessibility),
    };
  }

  calculate(): DataMaturityOutput {
    const cats = this.getCategoryScores();
    const weighted =
      cats.collection.score * WEIGHTS.collection +
      cats.storage.score * WEIGHTS.storage +
      cats.integration.score * WEIGHTS.integration +
      cats.governance.score * WEIGHTS.governance +
      cats.accessibility.score * WEIGHTS.accessibility;

    const avgConfidence =
      (cats.collection.confidence +
        cats.storage.confidence +
        cats.integration.confidence +
        cats.governance.confidence +
        cats.accessibility.confidence) /
      5;

    const maturityIndex = Math.round(clamp(weighted, 0, 100) * 100) / 100;
    const maturityStage = indexToStage(maturityIndex);
    const confidenceScore = Math.round(avgConfidence * 100) / 100;

    return {
      ...cats,
      maturity_stage: maturityStage,
      confidence_score: clamp(confidenceScore, 0, 1),
      maturity_index: maturityIndex,
      details: {
        weights: WEIGHTS,
        stage_label: STAGE_LABELS[maturityStage],
      },
    };
  }

  toJSON(): DataMaturityOutput {
    return this.calculate();
  }
}

/** One-shot: run engine on audit inputs and return structured result */
export function runDataMaturityAudit(inputs: AuditInputs): DataMaturityOutput {
  const engine = new DataMaturityEngine(inputs);
  return engine.calculate();
}
