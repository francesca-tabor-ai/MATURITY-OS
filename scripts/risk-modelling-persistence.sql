-- Platform Infrastructure — Risk Modelling Engine: persistence procedures

-- 1. Function: insert risk model result (probability + expected loss)
CREATE OR REPLACE FUNCTION insert_risk_model_result(
  p_organisation_id          UUID,
  p_initiative_name          VARCHAR(255) DEFAULT NULL,
  p_probability_of_failure   NUMERIC,
  p_confidence_interval_low NUMERIC DEFAULT NULL,
  p_confidence_interval_high NUMERIC DEFAULT NULL,
  p_expected_financial_loss  NUMERIC,
  p_loss_before_mitigation   NUMERIC DEFAULT NULL,
  p_risk_tier               VARCHAR(20) DEFAULT NULL,
  p_details                 JSONB DEFAULT '{}',
  p_created_by              UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO risk_model_results (
    organisation_id, initiative_name, probability_of_failure,
    confidence_interval_low, confidence_interval_high,
    expected_financial_loss, loss_before_mitigation, risk_tier,
    details, created_by
  ) VALUES (
    p_organisation_id, p_initiative_name, p_probability_of_failure,
    p_confidence_interval_low, p_confidence_interval_high,
    p_expected_financial_loss, p_loss_before_mitigation, p_risk_tier,
    p_details, p_created_by
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
