/**
 * Module 2.3: Executive Dashboard™
 * Aggregates latest data from Data/AI maturity, classification, financial impact,
 * ROI, risk, and roadmap; prepares a single payload for the dashboard UI.
 */

import { queryOne, query } from '@/lib/db';
import type {
  ExecutiveDashboardData,
  DashboardMaturity,
  DashboardClassification,
  DashboardFinancial,
  DashboardROI,
  DashboardRisk,
  DashboardRoadmap,
} from './executive-dashboard-types';

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${Math.round(n)}`;
}

/** Raw row types from DB */
interface DataMaturityRow {
  maturity_stage: number;
  maturity_index: number;
  created_at: string;
}
interface AIMaturityRow {
  maturity_stage: number;
  maturity_score: number;
  created_at: string;
}
interface ClassificationRow {
  classification_string: string;
  matrix_x_coordinate: number;
  matrix_y_coordinate: number;
  risk_classification: string;
  opportunity_classification: string | null;
  created_at: string;
}
interface FinancialRow {
  revenue_upside: number;
  profit_margin_expansion_value: number | null;
  cost_reduction: number;
  created_at: string;
}
interface ROIRow {
  total_investment: number;
  expected_roi_pct: number | null;
  payback_period_years: number | null;
  created_at: string;
}
interface RiskRow {
  overall_risk_score: number;
  risk_level: string;
  ai_misalignment_risk_score: number;
  infrastructure_risk_score: number;
  operational_risk_score: number;
  strategic_risk_score: number;
  created_at: string;
}
interface RoadmapRow {
  roadmap: { phases?: { name: string; estimated_cost: number; projected_impact_value: number }[]; total_estimated_cost?: number; total_projected_impact?: number };
  generation_date: string;
}

/**
 * Prepare raw aggregated data into dashboard-ready format (numbers formatted, structure for charts).
 */
export function prepare_dashboard_data(
  organisationId: string,
  raw: {
    data_maturity: DataMaturityRow | null;
    ai_maturity: AIMaturityRow | null;
    classification: ClassificationRow | null;
    financial: FinancialRow | null;
    roi: ROIRow | null;
    risk: RiskRow | null;
    roadmap: RoadmapRow | null;
  }
): ExecutiveDashboardData {
  const marginVal = raw.financial?.profit_margin_expansion_value ?? 0;
  const totalImpact = (raw.financial?.revenue_upside ?? 0) + marginVal + (raw.financial?.cost_reduction ?? 0);

  const maturity: DashboardMaturity | null =
    raw.data_maturity && raw.ai_maturity
      ? {
          data_maturity_index: Number(raw.data_maturity.maturity_index),
          data_maturity_stage: Number(raw.data_maturity.maturity_stage),
          ai_maturity_score: Number(raw.ai_maturity.maturity_score),
          ai_maturity_stage: Number(raw.ai_maturity.maturity_stage),
          data_created_at: raw.data_maturity.created_at,
          ai_created_at: raw.ai_maturity.created_at,
        }
      : null;

  const classification: DashboardClassification | null = raw.classification
    ? {
        classification_string: raw.classification.classification_string,
        matrix_x: Number(raw.classification.matrix_x_coordinate),
        matrix_y: Number(raw.classification.matrix_y_coordinate),
        risk: raw.classification.risk_classification,
        opportunity: raw.classification.opportunity_classification ?? undefined,
        created_at: raw.classification.created_at,
      }
    : null;

  const financial: DashboardFinancial | null = raw.financial
    ? {
        revenue_upside: Number(raw.financial.revenue_upside),
        profit_margin_expansion_value: marginVal,
        cost_reduction: Number(raw.financial.cost_reduction),
        total_impact: totalImpact,
        revenue_upside_formatted: formatCurrency(Number(raw.financial.revenue_upside)),
        margin_formatted: formatCurrency(marginVal),
        cost_reduction_formatted: formatCurrency(Number(raw.financial.cost_reduction)),
        total_formatted: formatCurrency(totalImpact),
        created_at: raw.financial.created_at,
      }
    : null;

  const roi: DashboardROI | null = raw.roi
    ? {
        total_investment: Number(raw.roi.total_investment),
        expected_roi_pct: raw.roi.expected_roi_pct != null ? Number(raw.roi.expected_roi_pct) : null,
        payback_period_years: raw.roi.payback_period_years != null ? Number(raw.roi.payback_period_years) : null,
        total_investment_formatted: formatCurrency(Number(raw.roi.total_investment)),
        created_at: raw.roi.created_at,
      }
    : null;

  const risk: DashboardRisk | null = raw.risk
    ? {
        overall_risk_score: Number(raw.risk.overall_risk_score),
        risk_level: raw.risk.risk_level,
        ai_misalignment: Number(raw.risk.ai_misalignment_risk_score),
        infrastructure: Number(raw.risk.infrastructure_risk_score),
        operational: Number(raw.risk.operational_risk_score),
        strategic: Number(raw.risk.strategic_risk_score),
        created_at: raw.risk.created_at,
      }
    : null;

  const phases = raw.roadmap?.roadmap?.phases ?? [];
  const totalCost = raw.roadmap?.roadmap?.total_estimated_cost ?? phases.reduce((s, p) => s + (p.estimated_cost ?? 0), 0);
  const totalProj = raw.roadmap?.roadmap?.total_projected_impact ?? phases.reduce((s, p) => s + (p.projected_impact_value ?? 0), 0);

  const roadmap: DashboardRoadmap | null = raw.roadmap
    ? {
        phase_count: phases.length,
        total_estimated_cost: totalCost,
        total_projected_impact: totalProj,
        total_cost_formatted: formatCurrency(totalCost),
        total_impact_formatted: formatCurrency(totalProj),
        phases: phases.map((p) => ({
          name: p.name ?? 'Phase',
          estimated_cost: p.estimated_cost ?? 0,
          projected_impact_value: p.projected_impact_value ?? 0,
        })),
        generation_date: raw.roadmap.generation_date,
      }
    : null;

  return {
    organisation_id: organisationId,
    maturity,
    classification,
    financial,
    roi,
    risk,
    roadmap,
  };
}

/**
 * Fetch latest data from all dashboard sources for an organisation and return prepared dashboard data.
 */
export async function getExecutiveDashboardData(organisationId: string): Promise<ExecutiveDashboardData> {
  const [dataMaturity, aiMaturity, classification, financial, roi, risk, roadmap] = await Promise.all([
    queryOne<DataMaturityRow>(
      `SELECT maturity_stage, maturity_index, created_at
       FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organisationId]
    ),
    queryOne<AIMaturityRow>(
      `SELECT maturity_stage, maturity_score, created_at
       FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organisationId]
    ),
    queryOne<ClassificationRow>(
      `SELECT classification_string, matrix_x_coordinate, matrix_y_coordinate,
              risk_classification, opportunity_classification, created_at
       FROM maturity_classifications WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organisationId]
    ),
    queryOne<FinancialRow>(
      `SELECT revenue_upside, profit_margin_expansion_value, cost_reduction, created_at
       FROM financial_impact_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organisationId]
    ),
    queryOne<ROIRow>(
      `SELECT total_investment, expected_roi_pct, payback_period_years, created_at
       FROM roi_investment_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organisationId]
    ),
    queryOne<RiskRow>(
      `SELECT overall_risk_score, risk_level, ai_misalignment_risk_score, infrastructure_risk_score,
              operational_risk_score, strategic_risk_score, created_at
       FROM risk_assessments WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organisationId]
    ),
    queryOne<RoadmapRow>(
      `SELECT roadmap, generation_date
       FROM transformation_roadmaps WHERE organisation_id = $1 ORDER BY generation_date DESC LIMIT 1`,
      [organisationId]
    ),
  ]);

  const raw = {
    data_maturity: dataMaturity,
    ai_maturity: aiMaturity,
    classification: classification,
    financial: financial,
    roi: roi,
    risk: risk,
    roadmap: roadmap,
  };

  return prepare_dashboard_data(organisationId, raw);
}
