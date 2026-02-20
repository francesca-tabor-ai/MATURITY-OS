-- Platform Infrastructure — Scoring Engine: stored procedures for score persistence
-- Inserts into data_maturity_results, ai_maturity_results, maturity_classifications, risk_assessments.

-- 1. Data maturity: insert result (simplified; full audit flow may use data_audit_inputs first)
CREATE OR REPLACE FUNCTION insert_data_maturity_score(
  p_organisation_id    UUID,
  p_audit_input_id     UUID,
  p_collection_score   NUMERIC,
  p_storage_score      NUMERIC,
  p_integration_score  NUMERIC,
  p_governance_score   NUMERIC,
  p_accessibility_score NUMERIC,
  p_maturity_stage     INTEGER,
  p_confidence_score  NUMERIC,
  p_maturity_index    NUMERIC,
  p_details           JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO data_maturity_results (
    audit_input_id, organisation_id,
    collection_score, storage_score, integration_score, governance_score, accessibility_score,
    maturity_stage, confidence_score, maturity_index, details
  ) VALUES (
    p_audit_input_id, p_organisation_id,
    p_collection_score, p_storage_score, p_integration_score, p_governance_score, p_accessibility_score,
    p_maturity_stage, p_confidence_score, p_maturity_index, p_details
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 2. AI maturity: insert result
CREATE OR REPLACE FUNCTION insert_ai_maturity_score(
  p_organisation_id   UUID,
  p_audit_input_id    UUID,
  p_automation_score  NUMERIC,
  p_ai_usage_score    NUMERIC,
  p_deployment_score  NUMERIC,
  p_maturity_stage    INTEGER,
  p_maturity_score    NUMERIC,
  p_details           JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO ai_maturity_results (
    audit_input_id, organisation_id,
    automation_score, ai_usage_score, deployment_score,
    maturity_stage, maturity_score, details
  ) VALUES (
    p_audit_input_id, p_organisation_id,
    p_automation_score, p_ai_usage_score, p_deployment_score,
    p_maturity_stage, p_maturity_score, p_details
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 3. Maturity classification (includes alignment in details if passed)
CREATE OR REPLACE FUNCTION insert_maturity_classification(
  p_organisation_id       UUID,
  p_data_maturity_index   NUMERIC,
  p_ai_maturity_score     NUMERIC,
  p_classification_string VARCHAR(100),
  p_matrix_x_coordinate   NUMERIC,
  p_matrix_y_coordinate   NUMERIC,
  p_risk_classification   VARCHAR(50),
  p_opportunity_classification VARCHAR(150) DEFAULT NULL,
  p_data_audit_result_id  UUID DEFAULT NULL,
  p_ai_audit_result_id    UUID DEFAULT NULL,
  p_details               JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO maturity_classifications (
    organisation_id, data_maturity_index, ai_maturity_score,
    classification_string, matrix_x_coordinate, matrix_y_coordinate,
    risk_classification, opportunity_classification,
    data_audit_result_id, ai_audit_result_id, details
  ) VALUES (
    p_organisation_id, p_data_maturity_index, p_ai_maturity_score,
    p_classification_string, p_matrix_x_coordinate, p_matrix_y_coordinate,
    p_risk_classification, p_opportunity_classification,
    p_data_audit_result_id, p_ai_audit_result_id, p_details
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 4. Risk assessment: insert
CREATE OR REPLACE FUNCTION insert_risk_assessment(
  p_organisation_id             UUID,
  p_ai_misalignment_risk_score  NUMERIC,
  p_infrastructure_risk_score   NUMERIC,
  p_operational_risk_score     NUMERIC,
  p_strategic_risk_score       NUMERIC,
  p_overall_risk_score         NUMERIC,
  p_risk_level                 VARCHAR(20),
  p_details                    JSONB DEFAULT '{}',
  p_inputs                     JSONB DEFAULT '{}',
  p_created_by                 UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO risk_assessments (
    organisation_id, ai_misalignment_risk_score, infrastructure_risk_score,
    operational_risk_score, strategic_risk_score, overall_risk_score, risk_level,
    details, inputs, created_by
  ) VALUES (
    p_organisation_id, p_ai_misalignment_risk_score, p_infrastructure_risk_score,
    p_operational_risk_score, p_strategic_risk_score, p_overall_risk_score, p_risk_level,
    p_details, p_inputs, p_created_by
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
