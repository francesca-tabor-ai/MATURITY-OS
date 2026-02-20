/** Core Module 0.2: Data Maturity Audit Engine™ – input/output types */

export interface DataCollectionInput {
  data_sources_identified?: number;
  structured_data_pct?: number;
  unstructured_data_pct?: number;
  data_completeness_score?: number; // 0-100
  automated_collection?: boolean;
  collection_frequency?: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'ad-hoc' | 'none';
}

export interface DataStorageInput {
  storage_types?: ('spreadsheets' | 'database' | 'warehouse' | 'lakehouse' | 'data_lake')[];
  cloud_vs_on_prem?: 'cloud' | 'hybrid' | 'on-premise';
  real_time_processing?: boolean;
  batch_processing?: boolean;
  scalability_rating?: number; // 1-5
  security_rating?: number; // 1-5
  accessibility_rating?: number; // 1-5
}

export interface DataIntegrationInput {
  integrated_systems_count?: number;
  api_available?: boolean;
  pipeline_maturity?: 'none' | 'manual' | 'semi-automated' | 'fully-automated';
  etl_elt_process?: boolean;
  data_quality_checks?: boolean;
  real_time_sync?: boolean;
}

export interface DataGovernanceInput {
  data_ownership_defined?: boolean;
  data_quality_controls?: boolean;
  metadata_management?: 'none' | 'basic' | 'standard' | 'advanced';
  policies_documented?: boolean;
  compliance_framework?: string | null;
  data_catalog?: boolean;
}

export interface DataAccessibilityInput {
  self_service_analytics?: boolean;
  real_time_data_access?: boolean;
  cross_functional_access?: boolean;
  role_based_access?: boolean;
  access_rating?: number; // 1-5
  reporting_tools?: ('none' | 'spreadsheets' | 'bi_tools' | 'embedded')[];
}

export interface AuditInputs {
  collection?: DataCollectionInput;
  storage?: DataStorageInput;
  integration?: DataIntegrationInput;
  governance?: DataGovernanceInput;
  accessibility?: DataAccessibilityInput;
}

export interface CategoryScore {
  score: number; // 0-100
  confidence: number; // 0-1
}

export interface DataMaturityOutput {
  collection: CategoryScore & { raw?: DataCollectionInput };
  storage: CategoryScore & { raw?: DataStorageInput };
  integration: CategoryScore & { raw?: DataIntegrationInput };
  governance: CategoryScore & { raw?: DataGovernanceInput };
  accessibility: CategoryScore & { raw?: DataAccessibilityInput };
  maturity_stage: number; // 1-6
  confidence_score: number; // 0-1
  maturity_index: number; // 0-100
  details?: Record<string, unknown>;
}
