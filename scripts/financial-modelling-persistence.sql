-- Platform Infrastructure — Financial Modelling Engine: persistence procedures
-- Inserts/updates for financial impact results; link to organisation and audit context.

-- 1. Function: insert financial impact result (returns new id)
CREATE OR REPLACE FUNCTION insert_financial_impact_result(
  p_organisation_id     UUID,
  p_revenue_input       NUMERIC,
  p_profit_margin_input NUMERIC,
  p_headcount_input     INTEGER,
  p_industry_benchmark  VARCHAR(100),
  p_data_maturity_score NUMERIC,
  p_ai_maturity_score   NUMERIC,
  p_operational_cost    NUMERIC DEFAULT NULL,
  p_revenue_upside      NUMERIC,
  p_profit_margin_expansion_pct  NUMERIC DEFAULT NULL,
  p_profit_margin_expansion_value NUMERIC DEFAULT NULL,
  p_cost_reduction      NUMERIC,
  p_details             JSONB DEFAULT '{}',
  p_created_by          UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO financial_impact_results (
    organisation_id, revenue_input, profit_margin_input, headcount_input,
    industry_benchmark, data_maturity_score, ai_maturity_score, operational_cost_input,
    revenue_upside, profit_margin_expansion_pct, profit_margin_expansion_value, cost_reduction,
    details, created_by
  ) VALUES (
    p_organisation_id, p_revenue_input, p_profit_margin_input, p_headcount_input,
    p_industry_benchmark, p_data_maturity_score, p_ai_maturity_score, p_operational_cost,
    p_revenue_upside, p_profit_margin_expansion_pct, p_profit_margin_expansion_value, p_cost_reduction,
    p_details, p_created_by
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 2. Function: upsert latest “summary” row per org (optional: use a dedicated summary table or update a single row)
-- Here we only provide insert; updates can be done by application or via a separate update function.

-- 3. Example: call from application (equivalent to single INSERT)
-- SELECT insert_financial_impact_result(
--   'org-uuid', 5000000, 10, 500, 'Technology', 55, 60, NULL,
--   250000, 1.5, 75000, 120000, '{"revenue_impact": {...}}'::jsonb, 'user-uuid'
-- );
