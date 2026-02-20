/**
 * Module 6.3: Enterprise Digital Twin™
 * Data model construction, predictive state simulation, and path optimization.
 */

import type {
  DigitalTwinState,
  TwinNode,
  TwinEdge,
  TwinMaturity,
  TwinFinancial,
  TwinRisk,
  TwinCapabilities,
  TwinRoadmap,
  TwinIntervention,
  SimulatedTwinState,
  TwinGoal,
  OptimizedAction,
  OptimizedTransformationPlan,
} from './digital-twin-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Integrated data from MATURITY OS modules (e.g. from API/DB) */
export interface IntegratedTwinContext {
  maturity: Partial<TwinMaturity>;
  financial: Partial<TwinFinancial>;
  risk: Partial<TwinRisk>;
  capabilities?: Partial<TwinCapabilities>;
  roadmap?: Partial<TwinRoadmap>;
}

/**
 * Build graph nodes and edges from state dimensions (causal links: data → AI → financial, risk).
 */
function buildGraph(maturity: TwinMaturity, financial: TwinFinancial, risk: TwinRisk): { nodes: TwinNode[]; edges: TwinEdge[] } {
  const nodes: TwinNode[] = [
    { id: 'data_maturity', label: 'Data maturity', type: 'maturity', value: maturity.data_maturity_index, unit: '0-100' },
    { id: 'ai_maturity', label: 'AI maturity', type: 'maturity', value: maturity.ai_maturity_score, unit: '0-100' },
    { id: 'revenue', label: 'Revenue', type: 'financial', value: financial.revenue, unit: 'currency' },
    { id: 'profit', label: 'Profit', type: 'financial', value: financial.profit, unit: 'currency' },
    { id: 'valuation', label: 'Valuation', type: 'financial', value: financial.valuation, unit: 'currency' },
    { id: 'risk', label: 'Risk score', type: 'risk', value: risk.overall_risk_score, unit: '0-100' },
  ];
  const edges: TwinEdge[] = [
    { source_id: 'data_maturity', target_id: 'ai_maturity', strength: 0.8, label: 'Data quality → AI accuracy' },
    { source_id: 'ai_maturity', target_id: 'revenue', strength: 0.6, label: 'AI → Revenue upside' },
    { source_id: 'ai_maturity', target_id: 'profit', strength: 0.5, label: 'Efficiency → Profit' },
    { source_id: 'data_maturity', target_id: 'risk', strength: -0.5, label: 'Governance → Risk reduction' },
    { source_id: 'revenue', target_id: 'valuation', strength: 0.7, label: 'Revenue → Valuation' },
  ];
  return { nodes, edges };
}

/**
 * Construct a full digital twin state from integrated context. Updates dynamically with new information.
 */
export function buildDigitalTwinState(
  context: IntegratedTwinContext,
  options?: { timestamp?: string; label?: string }
): DigitalTwinState {
  const now = options?.timestamp ?? new Date().toISOString();
  const maturity: TwinMaturity = {
    data_maturity_index: clamp(context.maturity?.data_maturity_index ?? 50, 0, 100),
    data_maturity_stage: clamp(context.maturity?.data_maturity_stage ?? 2, 1, 6),
    ai_maturity_score: clamp(context.maturity?.ai_maturity_score ?? 50, 0, 100),
    ai_maturity_stage: clamp(context.maturity?.ai_maturity_stage ?? 2, 1, 7),
    collection_score: context.maturity?.collection_score,
    storage_score: context.maturity?.storage_score,
    integration_score: context.maturity?.integration_score,
    governance_score: context.maturity?.governance_score,
    accessibility_score: context.maturity?.accessibility_score,
    automation_score: context.maturity?.automation_score,
    ai_usage_score: context.maturity?.ai_usage_score,
    deployment_score: context.maturity?.deployment_score,
  };
  const revenue = Math.max(0, context.financial?.revenue ?? 5_000_000);
  const profitMargin = clamp(context.financial?.profit_margin_pct ?? 10, 0, 100);
  const profit = revenue * (profitMargin / 100);
  const financial: TwinFinancial = {
    revenue,
    profit,
    profit_margin_pct: profitMargin,
    valuation: context.financial?.valuation ?? revenue * 2.5,
    revenue_upside: context.financial?.revenue_upside,
    cost_reduction: context.financial?.cost_reduction,
  };
  const risk: TwinRisk = {
    overall_risk_score: clamp(context.risk?.overall_risk_score ?? 50, 0, 100),
    risk_level: context.risk?.risk_level ?? 'medium',
    ai_misalignment_score: context.risk?.ai_misalignment_score,
    infrastructure_score: context.risk?.infrastructure_score,
    operational_score: context.risk?.operational_score,
    strategic_score: context.risk?.strategic_score,
  };
  const capabilities: TwinCapabilities = {
    gap_count: context.capabilities?.gap_count ?? 0,
    high_priority_count: context.capabilities?.high_priority_count ?? 0,
    areas: context.capabilities?.areas ?? [],
    top_gaps: context.capabilities?.top_gaps ?? [],
  };
  const roadmap: TwinRoadmap = {
    total_initiatives: context.roadmap?.total_initiatives ?? 0,
    completed: context.roadmap?.completed ?? 0,
    in_progress: context.roadmap?.in_progress ?? 0,
    target_data_maturity: context.roadmap?.target_data_maturity,
    target_ai_maturity: context.roadmap?.target_ai_maturity,
    progress_pct: context.roadmap?.progress_pct,
  };
  const { nodes, edges } = buildGraph(maturity, financial, risk);
  return {
    timestamp: now,
    version: 1,
    maturity,
    financial,
    risk,
    capabilities,
    roadmap,
    nodes,
    edges,
    label: options?.label,
  };
}

/**
 * Enterprise Digital Twin: holds current state and supports simulation and optimization.
 */
export class EnterpriseDigitalTwin {
  private state: DigitalTwinState;
  private organisationId: string;

  constructor(organisationId: string, initialState: DigitalTwinState) {
    this.organisationId = organisationId;
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  getState(): DigitalTwinState {
    return JSON.parse(JSON.stringify(this.state));
  }

  updateState(context: IntegratedTwinContext): void {
    this.state = buildDigitalTwinState(context, {
      timestamp: new Date().toISOString(),
      label: this.state.label,
    });
  }

  /**
   * Simulate the twin's state at a future time given a set of interventions.
   * Uses causal relationships: interventions improve maturity/governance → financial/risk follow.
   */
  simulate_digital_twin_state(
    future_months: number,
    interventions: TwinIntervention[] = []
  ): SimulatedTwinState {
    const horizon = clamp(future_months, 1, 60);
    let dataM = this.state.maturity.data_maturity_index;
    let aiM = this.state.maturity.ai_maturity_score;
    let revenue = this.state.financial.revenue;
    let marginPct = this.state.financial.profit_margin_pct;
    let riskScore = this.state.risk.overall_risk_score;

    for (const int of interventions) {
      const intensity = clamp(int.intensity, 0, 1);
      const duration = int.duration_months ?? 12;
      const effectiveMonths = Math.min(duration, horizon);
      if (int.type === 'investment' && int.target.toLowerCase().includes('data')) {
        dataM = clamp(dataM + 8 * intensity * (effectiveMonths / 12), 0, 100);
      } else if (int.type === 'investment' && (int.target.toLowerCase().includes('ai') || int.target.toLowerCase().includes('ml'))) {
        aiM = clamp(aiM + 7 * intensity * (effectiveMonths / 12), 0, 100);
      } else if (int.type === 'governance') {
        dataM = clamp(dataM + 5 * intensity * (effectiveMonths / 12), 0, 100);
        riskScore = clamp(riskScore - 6 * intensity * (effectiveMonths / 12), 0, 100);
      } else if (int.type === 'technology') {
        aiM = clamp(aiM + 6 * intensity * (effectiveMonths / 12), 0, 100);
        dataM = clamp(dataM + 3 * intensity * (effectiveMonths / 12), 0, 100);
      } else if (int.type === 'capability' || int.type === 'process') {
        aiM = clamp(aiM + 4 * intensity * (effectiveMonths / 12), 0, 100);
        dataM = clamp(dataM + 3 * intensity * (effectiveMonths / 12), 0, 100);
      }
    }

    const maturityFactor = (dataM + aiM) / 200;
    const revenueGrowth = 0.02 + maturityFactor * 0.06;
    const monthsToYears = horizon / 12;
    revenue = revenue * Math.pow(1 + revenueGrowth, monthsToYears);
    marginPct = clamp(marginPct + maturityFactor * 4, 0, 100);
    const profit = revenue * (marginPct / 100);
    const valuation = revenue * (2 + maturityFactor * 1.2);

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + horizon);

    const simulatedState = buildDigitalTwinState(
      {
        maturity: {
          data_maturity_index: Math.round(dataM * 100) / 100,
          data_maturity_stage: Math.min(6, Math.floor(dataM / 17) + 1),
          ai_maturity_score: Math.round(aiM * 100) / 100,
          ai_maturity_stage: Math.min(7, Math.floor(aiM / 15) + 1),
        },
        financial: { revenue, profit, profit_margin_pct: marginPct, valuation },
        risk: {
          overall_risk_score: Math.round(clamp(riskScore, 0, 100) * 100) / 100,
          risk_level: riskScore > 60 ? 'high' : riskScore > 35 ? 'medium' : 'low',
        },
        capabilities: this.state.capabilities,
        roadmap: this.state.roadmap,
      },
      { timestamp: futureDate.toISOString(), label: 'simulated' }
    );
    simulatedState.nodes = buildGraph(
      simulatedState.maturity,
      simulatedState.financial,
      simulatedState.risk
    ).nodes;
    simulatedState.edges = buildGraph(
      simulatedState.maturity,
      simulatedState.financial,
      simulatedState.risk
    ).edges;

    return {
      state: simulatedState,
      future_timestamp: futureDate.toISOString(),
      months_ahead: horizon,
      interventions_applied: interventions,
      confidence_interval: { low: 0.75, high: 0.95 },
    };
  }

  /**
   * Optimize pathway to achieve a goal: explore intervention sequences and recommend best plan.
   */
  optimize_digital_twin_path(goal: TwinGoal): OptimizedTransformationPlan {
    const actions: OptimizedAction[] = [];
    const interventions: TwinIntervention[] = [];
    const horizon = clamp(goal.horizon_months, 6, 48);

    if (goal.type === 'ai_maturity_stage') {
      const targetScore = Math.min(7, Math.max(1, goal.target_value)) * (100 / 7);
      const gap = targetScore - this.state.maturity.ai_maturity_score;
      if (gap > 5) {
        interventions.push({
          id: 'opt-ai-1',
          type: 'investment',
          target: 'AI/ML capability',
          intensity: 0.8,
          duration_months: Math.min(12, horizon),
          description: 'Invest in AI talent and platforms',
        });
        interventions.push({
          id: 'opt-data-1',
          type: 'investment',
          target: 'Data infrastructure',
          intensity: 0.6,
          duration_months: Math.min(12, horizon),
          description: 'Improve data quality for AI',
        });
      }
    } else if (goal.type === 'data_maturity_stage') {
      const targetScore = Math.min(6, Math.max(1, goal.target_value)) * (100 / 6);
      const gap = targetScore - this.state.maturity.data_maturity_index;
      if (gap > 5) {
        interventions.push({
          id: 'opt-gov-1',
          type: 'governance',
          target: 'Data governance',
          intensity: 0.7,
          duration_months: Math.min(12, horizon),
          description: 'Implement data governance policy',
        });
        interventions.push({
          id: 'opt-tech-1',
          type: 'technology',
          target: 'Data platform',
          intensity: 0.6,
          duration_months: Math.min(12, horizon),
          description: 'Deploy modern data stack',
        });
      }
    } else if (goal.type === 'profit_increase_pct') {
      const targetMult = 1 + goal.target_value / 100;
      interventions.push({
        id: 'opt-ai-profit',
        type: 'investment',
        target: 'AI automation',
        intensity: 0.7,
        duration_months: horizon,
        description: 'AI-driven efficiency to expand margin',
      });
      interventions.push({
        id: 'opt-data-profit',
        type: 'investment',
        target: 'Data quality',
        intensity: 0.5,
        duration_months: horizon,
        description: 'Better data for decisioning',
      });
    } else if (goal.type === 'risk_reduction') {
      interventions.push({
        id: 'opt-gov-risk',
        type: 'governance',
        target: 'Governance and compliance',
        intensity: 0.8,
        duration_months: Math.min(12, horizon),
        description: 'Strengthen governance to reduce risk',
      });
    } else if (goal.type === 'revenue_increase_pct') {
      interventions.push({
        id: 'opt-ai-rev',
        type: 'investment',
        target: 'AI products',
        intensity: 0.75,
        duration_months: horizon,
        description: 'AI-enabled revenue growth',
      });
    }

    let startMonth = 0;
    for (let i = 0; i < interventions.length; i++) {
      const int = interventions[i];
      const endMonth = startMonth + (int.duration_months ?? 12);
      actions.push({
        order: i + 1,
        intervention: int,
        expected_impact: {},
        start_month: startMonth,
        end_month: Math.min(endMonth, horizon),
      });
      startMonth = endMonth;
    }

    const sim = this.simulate_digital_twin_state(horizon, interventions);
    const trade_offs: string[] = [
      'Execution depends on organisational capacity and change management.',
      'Financial outlay required for recommended interventions.',
    ];
    const risks: string[] = [
      'Delays or scope creep may extend timeline.',
      goal.minimize_risk ? 'Lower-risk path may slow goal achievement.' : 'Aggressive path may increase short-term risk.',
    ];

    return {
      goal,
      actions,
      projected_final_state: {
        maturity: sim.state.maturity,
        financial: sim.state.financial,
        risk: sim.state.risk,
      },
      total_duration_months: horizon,
      confidence_score: 0.78,
      trade_offs,
      risks,
    };
  }
}
