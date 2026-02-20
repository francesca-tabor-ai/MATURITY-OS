/** Module 1.3: Risk Assessment Engine™ – types */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIMisalignmentInput {
  ai_maturity_score?: number;
  strategic_goals_alignment?: 'low' | 'medium' | 'high';
  ai_projects_governance?: 'ad_hoc' | 'defined' | 'governed';
  ai_ethics_framework?: boolean;
}

export interface InfrastructureInput {
  storage_types?: string[];
  cloud_vs_on_prem?: 'cloud' | 'hybrid' | 'on_premise';
  integration_complexity?: 'low' | 'medium' | 'high';
  cybersecurity_rating?: number;
  backup_recovery?: 'none' | 'basic' | 'tested';
}

export interface OperationalInput {
  data_governance?: 'none' | 'basic' | 'mature';
  data_quality_controls?: boolean;
  team_skills_rating?: number;
  incident_response?: 'none' | 'reactive' | 'proactive';
  documentation_rating?: number;
}

export interface StrategicInput {
  industry_benchmark_gap?: number;
  regulatory_compliance?: 'at_risk' | 'compliant' | 'leading';
  competitive_data_ai_posture?: 'behind' | 'par' | 'ahead';
  data_ai_maturity_combined?: number;
}

export interface RiskAssessmentInputs {
  ai_misalignment?: AIMisalignmentInput;
  infrastructure?: InfrastructureInput;
  operational?: OperationalInput;
  strategic?: StrategicInput;
}

export interface CategoryRisk {
  score: number;
  factors?: string[];
}

export interface RiskAssessmentOutput {
  ai_misalignment_risk: CategoryRisk;
  infrastructure_risk: CategoryRisk;
  operational_risk: CategoryRisk;
  strategic_risk: CategoryRisk;
  overall_risk_score: number;
  risk_level: RiskLevel;
  summary?: string[];
  details?: Record<string, unknown>;
}
