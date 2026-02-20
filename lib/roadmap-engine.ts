/**
 * Module 2.1: Transformation Roadmap Generator™
 * Generates phased transformation roadmaps from maturity, gaps, and financial impact.
 */

import type {
  RoadmapAction,
  RoadmapPhase,
  TransformationRoadmap,
  RoadmapInputs,
  PrioritizationStrategy,
  CapabilityGap,
  FinancialImpactSummary,
} from './roadmap-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Default action templates keyed by area; cost/impact are scaled by inputs. */
function getActionTemplates(): Omit<RoadmapAction, 'id' | 'roi'>[] {
  return [
    { description: 'Implement data warehouse and single source of truth', estimated_cost: 200_000, projected_impact_value: 500_000, area: 'data' },
    { description: 'Establish data governance and quality controls', estimated_cost: 80_000, projected_impact_value: 200_000, area: 'governance' },
    { description: 'Integrate core systems and APIs', estimated_cost: 150_000, projected_impact_value: 400_000, area: 'infrastructure' },
    { description: 'Deploy predictive analytics (demand, churn)', estimated_cost: 120_000, projected_impact_value: 350_000, area: 'ai' },
    { description: 'Automate reporting and dashboards', estimated_cost: 60_000, projected_impact_value: 150_000, area: 'data' },
    { description: 'Pilot NLP or computer vision use case', estimated_cost: 180_000, projected_impact_value: 450_000, area: 'ai' },
    { description: 'Scale AI to production and decision automation', estimated_cost: 250_000, projected_impact_value: 700_000, area: 'ai' },
    { description: 'Data literacy and upskilling programme', estimated_cost: 40_000, projected_impact_value: 100_000, area: 'governance' },
    { description: 'Cybersecurity and access controls hardening', estimated_cost: 90_000, projected_impact_value: 220_000, area: 'infrastructure' },
  ];
}

/** Scale action cost/impact by maturity gap and optional financial impact total. */
function scaleAction(
  template: Omit<RoadmapAction, 'id' | 'roi'>,
  maturityGap: number,
  totalImpactHint?: number
): Omit<RoadmapAction, 'id' | 'roi'> {
  const gapFactor = clamp(maturityGap, 0.2, 1);
  const cost = Math.round(template.estimated_cost * (0.7 + 0.3 * gapFactor));
  let impact = Math.round(template.projected_impact_value * gapFactor);
  if (totalImpactHint != null && totalImpactHint > 0) {
    const scale = totalImpactHint / (getActionTemplates().reduce((s, t) => s + t.projected_impact_value * gapFactor, 0));
    impact = Math.round(impact * Math.min(scale, 2));
  }
  return {
    description: template.description,
    estimated_cost: cost,
    projected_impact_value: impact,
    projected_impact_label: impact >= 1_000_000 ? `+£${(impact / 1_000_000).toFixed(1)}M` : `+£${(impact / 1_000).toFixed(0)}K`,
    area: template.area,
  };
}

/**
 * Prioritize a list of actions by the given strategy.
 * Returns a new ordered array (does not mutate).
 */
export function prioritize_actions(
  actions: RoadmapAction[],
  strategy: PrioritizationStrategy
): RoadmapAction[] {
  const withRoi = actions.map((a) => ({
    ...a,
    roi: a.estimated_cost > 0 ? a.projected_impact_value / a.estimated_cost : 0,
  }));

  switch (strategy) {
    case 'highest_roi_first':
      return [...withRoi].sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0));
    case 'lowest_cost_first':
      return [...withRoi].sort((a, b) => a.estimated_cost - b.estimated_cost);
    case 'strategic_alignment':
      // Order: governance/data foundation first, then infrastructure, then AI
      const orderOf = (area?: string) => {
        if (area === 'governance' || area === 'data') return 0;
        if (area === 'infrastructure') return 1;
        if (area === 'ai') return 2;
        return 1;
      };
      return [...withRoi].sort((a, b) => {
        const o = orderOf(a.area) - orderOf(b.area);
        return o !== 0 ? o : (b.roi ?? 0) - (a.roi ?? 0);
      });
    default:
      return withRoi;
  }
}

/**
 * Generate a phased transformation roadmap from current/target maturity,
 * capability gaps, and financial impact.
 */
export function generate_roadmap(inputs: RoadmapInputs): TransformationRoadmap {
  const currentData = clamp(inputs.current_data_maturity, 0, 100);
  const currentAi = clamp(inputs.current_ai_maturity, 0, 100);
  const targetData = clamp(inputs.target_data_maturity, 0, 100);
  const targetAi = clamp(inputs.target_ai_maturity, 0, 100);
  const dataGap = (100 - currentData) / 100;
  const aiGap = (100 - currentAi) / 100;
  const maturityGap = (dataGap + aiGap) / 2;

  const totalImpactHint = inputs.financial_impact?.total_impact
    ?? (inputs.financial_impact?.revenue_upside ?? 0)
    + (inputs.financial_impact?.profit_margin_expansion_value ?? 0)
    + (inputs.financial_impact?.cost_reduction ?? 0);

  const templates = getActionTemplates();
  const actions: RoadmapAction[] = templates.map((t, i) => {
    const scaled = scaleAction(t, maturityGap, totalImpactHint > 0 ? totalImpactHint : undefined);
    const cost = scaled.estimated_cost;
    const roi = cost > 0 ? scaled.projected_impact_value / cost : 0;
    return {
      id: `action-${i + 1}`,
      ...scaled,
      roi,
    };
  });

  const strategy = inputs.prioritization ?? 'strategic_alignment';
  const prioritized = prioritize_actions(actions, strategy);

  // Add actions from capability_gaps if provided (as extra items)
  const gapActions: RoadmapAction[] = (inputs.capability_gaps ?? []).slice(0, 5).map((g, i) => {
    const cost = 50_000 + i * 20_000;
    const impact = Math.round(cost * (1.5 + maturityGap));
    return {
      id: `gap-${i + 1}`,
      description: g.description,
      estimated_cost: cost,
      projected_impact_value: impact,
      projected_impact_label: `+£${(impact / 1_000).toFixed(0)}K`,
      area: (g.area as RoadmapAction['area']) ?? 'other',
      roi: impact / cost,
    };
  });
  const allActions = prioritize_actions([...prioritized, ...gapActions], strategy);

  // Group into 3 phases: Foundation (0–33%), Build (33–66%), Scale (66–100%)
  const n = allActions.length;
  const phaseSizes = [
    Math.max(1, Math.ceil(n * 0.35)),
    Math.max(1, Math.ceil(n * 0.35)),
    Math.max(0, n - Math.ceil(n * 0.35) - Math.ceil(n * 0.35)),
  ].filter((s) => s > 0);
  let idx = 0;
  const phaseNames = ['Foundation', 'Build', 'Scale'];
  const phaseDescriptions = [
    'Establish data and governance foundations.',
    'Integrate systems and deploy initial analytics.',
    'Scale AI and automation for maximum impact.',
  ];
  const phases: RoadmapPhase[] = phaseSizes.map((size, pi) => {
    const phaseActions = allActions.slice(idx, idx + size);
    idx += size;
    const estimated_cost = phaseActions.reduce((s, a) => s + a.estimated_cost, 0);
    const projected_impact_value = phaseActions.reduce((s, a) => s + a.projected_impact_value, 0);
    return {
      id: `phase-${pi + 1}`,
      name: phaseNames[pi] ?? `Phase ${pi + 1}`,
      description: phaseDescriptions[pi] ?? '',
      order: pi + 1,
      actions: phaseActions,
      estimated_cost,
      projected_impact_value,
      projected_impact_label:
        projected_impact_value >= 1_000_000
          ? `+£${(projected_impact_value / 1_000_000).toFixed(1)}M`
          : `+£${(projected_impact_value / 1_000).toFixed(0)}K`,
    };
  });

  const total_estimated_cost = phases.reduce((s, p) => s + p.estimated_cost, 0);
  const total_projected_impact = phases.reduce((s, p) => s + p.projected_impact_value, 0);

  return {
    phases,
    total_estimated_cost,
    total_projected_impact,
    total_projected_impact_label:
      total_projected_impact >= 1_000_000
        ? `+£${(total_projected_impact / 1_000_000).toFixed(1)}M`
        : `+£${(total_projected_impact / 1_000).toFixed(0)}K`,
    generated_at: new Date().toISOString(),
    inputs_summary: {
      current_data_maturity: currentData,
      current_ai_maturity: currentAi,
      target_data_maturity: targetData,
      target_ai_maturity: targetAi,
      prioritization: strategy,
    },
  };
}
