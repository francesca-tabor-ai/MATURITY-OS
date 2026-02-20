/**
 * Module 6.3: Enterprise Digital Twin™ – types
 * Comprehensive data model integrating maturity, financials, risk, capabilities, roadmap.
 */

/** Single node in the twin graph (e.g. a dimension or subsystem) */
export interface TwinNode {
  id: string;
  label: string;
  type: 'maturity' | 'financial' | 'risk' | 'capability' | 'roadmap' | 'process';
  value: number;
  unit?: string;
  metadata?: Record<string, unknown>;
}

/** Directed relationship between nodes (e.g. data quality → AI accuracy) */
export interface TwinEdge {
  source_id: string;
  target_id: string;
  strength: number;
  label?: string;
}

/** Maturity slice of the twin */
export interface TwinMaturity {
  data_maturity_index: number;
  data_maturity_stage: number;
  ai_maturity_score: number;
  ai_maturity_stage: number;
  collection_score?: number;
  storage_score?: number;
  integration_score?: number;
  governance_score?: number;
  accessibility_score?: number;
  automation_score?: number;
  ai_usage_score?: number;
  deployment_score?: number;
}

/** Financial slice */
export interface TwinFinancial {
  revenue: number;
  profit: number;
  profit_margin_pct: number;
  valuation: number;
  revenue_upside?: number;
  cost_reduction?: number;
}

/** Risk slice */
export interface TwinRisk {
  overall_risk_score: number;
  risk_level: string;
  ai_misalignment_score?: number;
  infrastructure_score?: number;
  operational_score?: number;
  strategic_score?: number;
}

/** Capability gaps summary */
export interface TwinCapabilities {
  gap_count: number;
  high_priority_count: number;
  areas: string[];
  top_gaps: { id?: string; description: string; area?: string; priority?: string }[];
}

/** Roadmap progress summary */
export interface TwinRoadmap {
  total_initiatives: number;
  completed: number;
  in_progress: number;
  target_data_maturity?: number;
  target_ai_maturity?: number;
  progress_pct?: number;
}

/** Full digital twin state (current or simulated) */
export interface DigitalTwinState {
  timestamp: string;
  version: number;
  maturity: TwinMaturity;
  financial: TwinFinancial;
  risk: TwinRisk;
  capabilities: TwinCapabilities;
  roadmap: TwinRoadmap;
  /** Graph representation for visualization */
  nodes: TwinNode[];
  edges: TwinEdge[];
  /** Optional snapshot label (e.g. "current", "post-intervention") */
  label?: string;
}

/** Strategic intervention to apply in simulation */
export interface TwinIntervention {
  id: string;
  type: 'investment' | 'governance' | 'technology' | 'capability' | 'process';
  target: string;
  intensity: number;
  duration_months?: number;
  description?: string;
}

/** Result of simulating the twin at a future time */
export interface SimulatedTwinState {
  state: DigitalTwinState;
  future_timestamp: string;
  months_ahead: number;
  interventions_applied: TwinIntervention[];
  confidence_interval?: { low: number; high: number };
}

/** Goal for optimization */
export interface TwinGoal {
  type: 'ai_maturity_stage' | 'data_maturity_stage' | 'profit_increase_pct' | 'risk_reduction' | 'revenue_increase_pct';
  target_value: number;
  horizon_months: number;
  minimize_risk?: boolean;
}

/** One recommended action in an optimized plan */
export interface OptimizedAction {
  order: number;
  intervention: TwinIntervention;
  expected_impact: Partial<DigitalTwinState>;
  start_month: number;
  end_month?: number;
}

/** Optimized transformation plan */
export interface OptimizedTransformationPlan {
  goal: TwinGoal;
  actions: OptimizedAction[];
  projected_final_state: Partial<DigitalTwinState>;
  total_duration_months: number;
  confidence_score: number;
  trade_offs: string[];
  risks: string[];
}
