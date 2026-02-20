/** Core Module 0.3: AI Maturity Audit Engine™ – input/output types */

export interface AutomationInput {
  manual_workflow_pct?: number; // 0-100
  automated_workflow_pct?: number;
  rule_based_automation?: boolean;
  workflow_automation_level?: 'none' | 'basic' | 'moderate' | 'advanced' | 'full';
  process_automation_count?: number;
  sophistication_rating?: number; // 1-5
}

export interface AIUsageInput {
  predictive_models?: boolean;
  predictive_models_impact?: 'none' | 'pilot' | 'departmental' | 'enterprise';
  recommendation_systems?: boolean;
  recommendation_impact?: 'none' | 'pilot' | 'departmental' | 'enterprise';
  nlp_usage?: boolean;
  nlp_impact?: 'none' | 'pilot' | 'departmental' | 'enterprise';
  computer_vision?: boolean;
  computer_vision_impact?: 'none' | 'pilot' | 'departmental' | 'enterprise';
  ai_breadth_rating?: number; // 1-5
  ai_integration_rating?: number; // 1-5
}

export interface DeploymentInput {
  deployment_mode?: 'experimental' | 'pilot' | 'production' | 'enterprise_wide';
  scope?: 'isolated' | 'departmental' | 'cross_functional' | 'enterprise_wide';
  decision_automation?: 'human_only' | 'human_in_loop' | 'assisted' | 'fully_autonomous';
  production_workloads_count?: number;
  scalability_rating?: number; // 1-5
  reliability_rating?: number; // 1-5
}

export interface AIAuditInputs {
  automation?: AutomationInput;
  ai_usage?: AIUsageInput;
  deployment?: DeploymentInput;
}

export interface CategoryScore {
  score: number; // 0-100
  confidence: number; // 0-1
}

export interface AIMaturityOutput {
  automation: CategoryScore & { raw?: AutomationInput };
  ai_usage: CategoryScore & { raw?: AIUsageInput };
  deployment: CategoryScore & { raw?: DeploymentInput };
  maturity_stage: number; // 1-7
  maturity_score: number; // 0-100
  details?: Record<string, unknown>;
}
