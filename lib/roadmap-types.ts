/** Module 2.1: Transformation Roadmap Generator™ – types */

/** A single transformation action (e.g. "Implement data warehouse"). */
export interface RoadmapAction {
  id: string;
  description: string;
  estimated_cost: number;
  projected_impact_value: number;
  projected_impact_label?: string; // e.g. "+£10M profit"
  roi?: number; // impact / cost when cost > 0
  area?: 'data' | 'ai' | 'governance' | 'infrastructure' | 'other';
}

/** One phase of the roadmap (e.g. "Foundation", "Scale"). */
export interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  actions: RoadmapAction[];
  estimated_cost: number;
  projected_impact_value: number;
  projected_impact_label?: string;
}

/** Capability gap (from Module 2.2 or derived). */
export interface CapabilityGap {
  id?: string;
  description: string;
  area?: string;
  priority?: 'high' | 'medium' | 'low';
}

/** Financial impact summary (from Module 1.1). */
export interface FinancialImpactSummary {
  revenue_upside?: number;
  profit_margin_expansion_value?: number;
  cost_reduction?: number;
  total_impact?: number;
}

export type PrioritizationStrategy = 'highest_roi_first' | 'lowest_cost_first' | 'strategic_alignment';

export interface RoadmapInputs {
  current_data_maturity: number;
  current_ai_maturity: number;
  target_data_maturity: number;
  target_ai_maturity: number;
  capability_gaps?: CapabilityGap[];
  financial_impact?: FinancialImpactSummary;
  prioritization?: PrioritizationStrategy;
}

export interface TransformationRoadmap {
  phases: RoadmapPhase[];
  total_estimated_cost: number;
  total_projected_impact: number;
  total_projected_impact_label?: string;
  generated_at: string; // ISO
  inputs_summary?: {
    current_data_maturity: number;
    current_ai_maturity: number;
    target_data_maturity: number;
    target_ai_maturity: number;
    prioritization: PrioritizationStrategy;
  };
}
