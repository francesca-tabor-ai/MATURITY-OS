/**
 * Module 2.2: Capability Gap Analysis™
 * Identifies and prioritizes capability gaps from data/AI maturity vs ideal state.
 */

import type {
  CapabilityGapInputs,
  DataMaturitySummary,
  AIMaturitySummary,
  IdentifiedGap,
  CapabilityGapResult,
  CapabilityGapAnalysisOutput,
  PriorityLevel,
  GapDimension,
} from './capability-gap-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Ideal capabilities: description, dimension, and stage/score thresholds below which the capability is missing. */
const IDEAL_CAPABILITIES: {
  description: string;
  dimension: GapDimension;
  min_data_stage?: number;
  min_ai_stage?: number;
  min_data_score?: number;
  min_ai_score?: number;
  effort: 'low' | 'medium' | 'high';
}[] = [
  { description: 'Data pipeline automation', dimension: 'data_integration', min_data_score: 50, min_data_stage: 2, effort: 'medium' },
  { description: 'Data governance framework', dimension: 'data_governance', min_data_stage: 2, min_data_score: 40, effort: 'high' },
  { description: 'Model deployment infrastructure', dimension: 'deployment', min_ai_stage: 3, min_ai_score: 45, effort: 'high' },
  { description: 'Single source of truth / data warehouse', dimension: 'data_storage', min_data_stage: 2, min_data_score: 45, effort: 'high' },
  { description: 'Automated data collection and ingestion', dimension: 'data_collection', min_data_score: 50, effort: 'medium' },
  { description: 'Data quality controls and monitoring', dimension: 'data_governance', min_data_score: 35, effort: 'medium' },
  { description: 'API and integration layer', dimension: 'data_integration', min_data_score: 40, min_data_stage: 2, effort: 'medium' },
  { description: 'Self-service analytics and reporting', dimension: 'data_accessibility', min_data_score: 45, effort: 'low' },
  { description: 'Rule-based workflow automation', dimension: 'automation', min_ai_score: 30, min_ai_stage: 1, effort: 'low' },
  { description: 'Predictive analytics capability', dimension: 'ai_usage', min_ai_stage: 2, min_ai_score: 40, effort: 'medium' },
  { description: 'Production ML model lifecycle', dimension: 'deployment', min_ai_stage: 4, min_ai_score: 55, effort: 'high' },
  { description: 'Metadata management and data catalog', dimension: 'data_governance', min_data_stage: 3, min_data_score: 55, effort: 'medium' },
  { description: 'Real-time or near-real-time data access', dimension: 'data_accessibility', min_data_score: 50, effort: 'medium' },
  { description: 'Scalable cloud or hybrid storage', dimension: 'data_storage', min_data_score: 40, effort: 'high' },
  { description: 'NLP or advanced analytics use cases', dimension: 'ai_usage', min_ai_stage: 3, min_ai_score: 50, effort: 'high' },
  { description: 'Cross-functional data access and RBAC', dimension: 'data_accessibility', min_data_score: 45, effort: 'medium' },
  { description: 'Enterprise-wide automation and orchestration', dimension: 'automation', min_ai_stage: 3, min_ai_score: 50, effort: 'high' },
  { description: 'Decision automation (human-in-the-loop or assisted)', dimension: 'deployment', min_ai_stage: 4, min_ai_score: 55, effort: 'high' },
];

/** Map dimension to category score getter. */
function getDataScore(d: DataMaturitySummary, dim: GapDimension): number {
  const m: Record<GapDimension, number | undefined> = {
    data_collection: d.collection_score,
    data_storage: d.storage_score,
    data_integration: d.integration_score,
    data_governance: d.governance_score,
    data_accessibility: d.accessibility_score,
    automation: undefined,
    ai_usage: undefined,
    deployment: undefined,
  };
  return m[dim] ?? d.maturity_index;
}

function getAIScore(a: AIMaturitySummary, dim: GapDimension): number {
  const m: Record<GapDimension, number | undefined> = {
    data_collection: undefined,
    data_storage: undefined,
    data_integration: undefined,
    data_governance: undefined,
    data_accessibility: undefined,
    automation: a.automation_score,
    ai_usage: a.ai_usage_score,
    deployment: a.deployment_score,
  };
  return m[dim] ?? a.maturity_score;
}

/**
 * Compare current state to ideal capabilities and return list of identified gaps.
 */
export function identify_capability_gaps(inputs: CapabilityGapInputs): IdentifiedGap[] {
  const data = inputs.data_maturity;
  const ai = inputs.ai_maturity;
  const targetDataStage = inputs.target_data_stage ?? 6;
  const targetAiStage = inputs.target_ai_stage ?? 7;

  const gaps: IdentifiedGap[] = [];
  let id = 0;

  for (const cap of IDEAL_CAPABILITIES) {
    const dataStage = clamp(data.maturity_stage, 1, 6);
    const dataIndex = clamp(data.maturity_index, 0, 100);
    const aiStage = clamp(ai.maturity_stage, 1, 7);
    const aiScore = clamp(ai.maturity_score, 0, 100);

    let isGap = false;
    const dim = cap.dimension;
    const dataScore = getDataScore(data, dim);
    const aiScoreForDim = getAIScore(ai, dim);

    if (cap.min_data_stage != null && dataStage < cap.min_data_stage) isGap = true;
    if (cap.min_data_score != null && (dataScore ?? dataIndex) < cap.min_data_score) isGap = true;
    if (cap.min_ai_stage != null && aiStage < cap.min_ai_stage) isGap = true;
    if (cap.min_ai_score != null && (aiScoreForDim ?? aiScore) < cap.min_ai_score) isGap = true;

    if (isGap) {
      gaps.push({
        id: `gap-${++id}`,
        description: cap.description,
        dimension: cap.dimension,
        current_score: dim.startsWith('data_') ? dataScore ?? dataIndex : aiScoreForDim ?? aiScore,
        required_stage: cap.min_data_stage ?? cap.min_ai_stage,
        effort_estimate: cap.effort,
      });
    }
  }

  return gaps;
}

const DIMENSION_TO_THEME: Record<GapDimension, string> = {
  data_collection: 'Data foundation',
  data_storage: 'Data foundation',
  data_integration: 'Data foundation',
  data_governance: 'Governance & quality',
  data_accessibility: 'Data access & analytics',
  automation: 'AI & automation',
  ai_usage: 'AI & automation',
  deployment: 'AI & deployment',
};

/** Impact weight for priority: higher = more critical to close first. */
const PRIORITY_IMPACT: Record<PriorityLevel, number> = { High: 3, Medium: 2, Low: 1 };
const EFFORT_WEIGHT: Record<'low' | 'medium' | 'high', number> = { low: 1, medium: 2, high: 3 };

/**
 * Assign priority (High/Medium/Low) and grouped theme to identified gaps.
 * Priority favours high impact on target maturity and lower effort (quick wins).
 */
export function prioritize_gaps(gaps: IdentifiedGap[]): CapabilityGapResult[] {
  return gaps.map((g) => {
    const theme = DIMENSION_TO_THEME[g.dimension];
    const effort = g.effort_estimate ?? 'medium';
    const effortNum = EFFORT_WEIGHT[effort];
    const score = g.current_score ?? 50;
    const gapSize = 100 - score;
    const impactScore = gapSize / 100 + (g.required_stage != null ? g.required_stage / 6 : 0.5);
    const priorityScore = impactScore * 2 - effortNum * 0.2;
    let priority_level: PriorityLevel = 'Medium';
    if (priorityScore >= 1.2 || (gapSize > 50 && effort === 'low')) priority_level = 'High';
    else if (priorityScore < 0.6 && effort === 'high') priority_level = 'Low';

    return {
      id: g.id,
      description: g.description,
      dimension: g.dimension,
      priority_level,
      grouped_theme: theme,
      current_score: g.current_score,
      effort_estimate: g.effort_estimate,
    };
  });
}

/** Build dimension scores for radar: current vs ideal 100. */
function buildDimensionScores(inputs: CapabilityGapInputs): { dimension: GapDimension; current: number; ideal: number }[] {
  const d = inputs.data_maturity;
  const a = inputs.ai_maturity;
  const dims: GapDimension[] = [
    'data_collection',
    'data_storage',
    'data_integration',
    'data_governance',
    'data_accessibility',
    'automation',
    'ai_usage',
    'deployment',
  ];
  return dims.map((dim) => ({
    dimension: dim,
    current: dim.startsWith('data_') ? getDataScore(d, dim) ?? d.maturity_index : getAIScore(a, dim) ?? a.maturity_score,
    ideal: 100,
  }));
}

/**
 * Run full capability gap analysis: identify + prioritize, return output with optional radar data.
 */
export function runCapabilityGapAnalysis(inputs: CapabilityGapInputs): CapabilityGapAnalysisOutput {
  const identified = identify_capability_gaps(inputs);
  const prioritized = prioritize_gaps(identified);

  return {
    gaps: prioritized,
    analysis_date: new Date().toISOString(),
    inputs_summary: {
      data_maturity_stage: inputs.data_maturity.maturity_stage,
      data_maturity_index: inputs.data_maturity.maturity_index,
      ai_maturity_stage: inputs.ai_maturity.maturity_stage,
      ai_maturity_score: inputs.ai_maturity.maturity_score,
    },
    dimension_scores: buildDimensionScores(inputs),
  };
}
