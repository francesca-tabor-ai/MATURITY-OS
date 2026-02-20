/**
 * Module 4.2: Portfolio Intelligence Dashboard™
 * Aggregates data maturity, AI maturity, financial impact, ROI, risk, and valuation
 * for all companies in a user's portfolio and computes portfolio-level metrics.
 */

import { query } from '@/lib/db';
import type {
  PortfolioCompany,
  PortfolioIntelligenceData,
  PortfolioPerformance,
} from './portfolio-intelligence-types';

/** Raw row from portfolio orgs query */
interface OrgRow {
  id: string;
  name: string;
  industry: string | null;
}

/** Raw row from latest-per-org queries */
interface DataMaturityRow {
  organisation_id: string;
  maturity_index: number;
}
interface AIMaturityRow {
  organisation_id: string;
  maturity_score: number;
}
interface FinancialRow {
  organisation_id: string;
  revenue_upside: number;
  profit_margin_expansion_value: number | null;
  cost_reduction: number;
}
interface ROIRow {
  organisation_id: string;
  total_investment: number;
  expected_roi_pct: number | null;
  payback_period_years: number | null;
}
interface RiskRow {
  organisation_id: string;
  overall_risk_score: number;
  risk_level: string;
}
interface ValuationRow {
  organisation_id: string;
  current_valuation: number;
  potential_valuation: number;
  valuation_upside: number;
  valuation_upside_pct: number | null;
}

function num(x: unknown): number | null {
  if (x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/**
 * Retrieve and consolidate latest data for every organisation in the user's portfolio.
 * Optional industry filter restricts to organisations in that industry.
 */
export async function getPortfolioIntelligenceData(
  userId: string,
  industryFilter: string | null
): Promise<PortfolioIntelligenceData> {
  const orgs = await query<OrgRow>(
    `SELECT o.id, o.name, o.industry
     FROM organisations o
     JOIN user_organisations uo ON uo.organisation_id = o.id
     WHERE uo.user_id = $1
       AND ($2::varchar IS NULL OR LOWER(TRIM(o.industry)) = LOWER(TRIM($2)))
     ORDER BY o.name`,
    [userId, industryFilter ?? null]
  );

  const organisationIds = orgs.map((o) => o.id);
  if (organisationIds.length === 0) {
    const industries = await query<{ industry: string | null }>(
      `SELECT DISTINCT o.industry FROM organisations o
       JOIN user_organisations uo ON uo.organisation_id = o.id
       WHERE uo.user_id = $1 AND o.industry IS NOT NULL AND TRIM(o.industry) != ''`,
      [userId]
    );
    return {
      companies: [],
      industry_filter: industryFilter,
      industries: industries.map((r) => r.industry).filter(Boolean) as string[],
    };
  }

  const [
    dataMaturityRows,
    aiMaturityRows,
    financialRows,
    roiRows,
    riskRows,
    valuationRows,
    industriesRows,
  ] = await Promise.all([
    query<DataMaturityRow>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, maturity_index
        FROM data_maturity_results
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, maturity_index FROM latest`,
      [organisationIds]
    ),
    query<AIMaturityRow>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, maturity_score
        FROM ai_maturity_results
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, maturity_score FROM latest`,
      [organisationIds]
    ),
    query<FinancialRow>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, revenue_upside, profit_margin_expansion_value, cost_reduction
        FROM financial_impact_results
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, revenue_upside, profit_margin_expansion_value, cost_reduction FROM latest`,
      [organisationIds]
    ),
    query<ROIRow>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, total_investment, expected_roi_pct, payback_period_years
        FROM roi_investment_results
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, total_investment, expected_roi_pct, payback_period_years FROM latest`,
      [organisationIds]
    ),
    query<RiskRow>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, overall_risk_score, risk_level
        FROM risk_assessments
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, created_at DESC
      ) SELECT organisation_id, overall_risk_score, risk_level FROM latest`,
      [organisationIds]
    ),
    query<ValuationRow>(
      `WITH latest AS (
        SELECT DISTINCT ON (organisation_id) organisation_id, current_valuation, potential_valuation, valuation_upside, valuation_upside_pct
        FROM company_valuations
        WHERE organisation_id = ANY($1::uuid[])
        ORDER BY organisation_id, analysis_date DESC
      ) SELECT organisation_id, current_valuation, potential_valuation, valuation_upside, valuation_upside_pct FROM latest`,
      [organisationIds]
    ),
    query<{ industry: string | null }>(
      `SELECT DISTINCT o.industry FROM organisations o
       JOIN user_organisations uo ON uo.organisation_id = o.id
       WHERE uo.user_id = $1 AND o.industry IS NOT NULL AND TRIM(o.industry) != ''`,
      [userId]
    ),
  ]);

  const dataByOrg = new Map(organisationIds.map((id) => [id, {} as Record<string, unknown>]));
  for (const r of dataMaturityRows) (dataByOrg.get(r.organisation_id)!).data_maturity_index = r.maturity_index;
  for (const r of aiMaturityRows) (dataByOrg.get(r.organisation_id)!).ai_maturity_score = r.maturity_score;
  for (const r of financialRows) {
    const row = dataByOrg.get(r.organisation_id)!;
    row.revenue_upside = r.revenue_upside;
    row.profit_margin_expansion_value = r.profit_margin_expansion_value;
    row.cost_reduction = r.cost_reduction;
  }
  for (const r of roiRows) {
    const row = dataByOrg.get(r.organisation_id)!;
    row.total_investment = r.total_investment;
    row.expected_roi_pct = r.expected_roi_pct;
    row.payback_period_years = r.payback_period_years;
  }
  for (const r of riskRows) {
    const row = dataByOrg.get(r.organisation_id)!;
    row.overall_risk_score = r.overall_risk_score;
    row.risk_level = r.risk_level;
  }
  for (const r of valuationRows) {
    const row = dataByOrg.get(r.organisation_id)!;
    row.current_valuation = r.current_valuation;
    row.potential_valuation = r.potential_valuation;
    row.valuation_upside = r.valuation_upside;
    row.valuation_upside_pct = r.valuation_upside_pct;
  }

  const companies: PortfolioCompany[] = orgs.map((org) => {
    const d = dataByOrg.get(org.id) || {};
    return {
      organisation_id: org.id,
      name: org.name,
      industry: org.industry,
      data_maturity_index: num(d.data_maturity_index) ?? null,
      ai_maturity_score: num(d.ai_maturity_score) ?? null,
      revenue_upside: num(d.revenue_upside) ?? null,
      profit_margin_expansion_value: num(d.profit_margin_expansion_value) ?? null,
      cost_reduction: num(d.cost_reduction) ?? null,
      total_investment: num(d.total_investment) ?? null,
      expected_roi_pct: num(d.expected_roi_pct) ?? null,
      payback_period_years: num(d.payback_period_years) ?? null,
      overall_risk_score: num(d.overall_risk_score) ?? null,
      risk_level: (d.risk_level as string) ?? null,
      current_valuation: num(d.current_valuation) ?? null,
      potential_valuation: num(d.potential_valuation) ?? null,
      valuation_upside: num(d.valuation_upside) ?? null,
      valuation_upside_pct: num(d.valuation_upside_pct) ?? null,
    };
  });

  return {
    companies,
    industry_filter: industryFilter,
    industries: industriesRows.map((r) => r.industry).filter(Boolean) as string[],
  };
}

/**
 * Compute portfolio-level metrics and identify top/bottom performers from aggregated data.
 */
export function analyzePortfolioPerformance(
  data: PortfolioIntelligenceData,
  options: { topN?: number } = {}
): PortfolioPerformance {
  const topN = Math.max(1, options.topN ?? 5);
  const companies = data.companies;

  const withDataMaturity = companies.filter((c) => c.data_maturity_index != null);
  const withAIMaturity = companies.filter((c) => c.ai_maturity_score != null);
  const withRisk = companies.filter((c) => c.overall_risk_score != null);

  const avg_data_maturity =
    withDataMaturity.length > 0
      ? withDataMaturity.reduce((s, c) => s + (c.data_maturity_index ?? 0), 0) / withDataMaturity.length
      : 0;
  const avg_ai_maturity =
    withAIMaturity.length > 0
      ? withAIMaturity.reduce((s, c) => s + (c.ai_maturity_score ?? 0), 0) / withAIMaturity.length
      : 0;
  const total_revenue_upside = companies.reduce((s, c) => s + (c.revenue_upside ?? 0), 0);
  const total_profit_expansion = companies.reduce((s, c) => s + (c.profit_margin_expansion_value ?? 0), 0);
  const total_cost_reduction = companies.reduce((s, c) => s + (c.cost_reduction ?? 0), 0);
  const total_financial_impact = total_revenue_upside + total_profit_expansion + total_cost_reduction;
  const avg_risk_score =
    withRisk.length > 0
      ? withRisk.reduce((s, c) => s + (c.overall_risk_score ?? 0), 0) / withRisk.length
      : 0;
  const total_valuation_upside = companies.reduce((s, c) => s + (c.valuation_upside ?? 0), 0);

  const withValuationUpside = companies.filter((c) => c.valuation_upside != null || c.valuation_upside_pct != null);
  const top_by_valuation_upside = [...withValuationUpside].sort((a, b) => {
    const aPct = a.valuation_upside_pct ?? 0;
    const bPct = b.valuation_upside_pct ?? 0;
    if (bPct !== aPct) return bPct - aPct;
    return (b.valuation_upside ?? 0) - (a.valuation_upside ?? 0);
  }).slice(0, topN);

  const avgMaturity = (c: PortfolioCompany) => {
    const d = c.data_maturity_index ?? 0;
    const a = c.ai_maturity_score ?? 0;
    if (d === 0 && a === 0) return -1;
    if (c.data_maturity_index != null && c.ai_maturity_score != null) return (d + a) / 2;
    return d || a;
  };
  const bottom_by_maturity = [...companies]
    .filter((c) => avgMaturity(c) >= 0)
    .sort((a, b) => avgMaturity(a) - avgMaturity(b))
    .slice(0, topN);

  const withRevenueUpside = companies.filter((c) => (c.revenue_upside ?? 0) > 0);
  const top_by_revenue_upside = [...withRevenueUpside]
    .sort((a, b) => (b.revenue_upside ?? 0) - (a.revenue_upside ?? 0))
    .slice(0, topN);

  return {
    company_count: companies.length,
    avg_data_maturity: Math.round(avg_data_maturity * 100) / 100,
    avg_ai_maturity: Math.round(avg_ai_maturity * 100) / 100,
    total_revenue_upside,
    total_profit_expansion,
    total_cost_reduction,
    total_financial_impact,
    avg_risk_score: Math.round(avg_risk_score * 100) / 100,
    total_valuation_upside,
    top_by_valuation_upside,
    bottom_by_maturity,
    top_by_revenue_upside,
  };
}
