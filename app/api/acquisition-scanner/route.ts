import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getPortfolioIntelligenceData } from '@/lib/portfolio-intelligence-service';
import {
  identify_undervalued_companies,
  score_acquisition_targets,
  apply_acquisition_filters,
} from '@/lib/acquisition-scanner-engine';
import type { AcquisitionCandidate, AcquisitionScannerFilters } from '@/lib/acquisition-scanner-types';
import type { PortfolioCompany } from '@/lib/portfolio-intelligence-types';
import { query } from '@/lib/db';

function toCandidate(p: PortfolioCompany): AcquisitionCandidate {
  return {
    organisation_id: p.organisation_id,
    name: p.name,
    industry: p.industry,
    current_valuation: p.current_valuation,
    data_maturity_index: p.data_maturity_index,
    ai_maturity_score: p.ai_maturity_score,
    potential_valuation: p.potential_valuation,
    valuation_upside: p.valuation_upside,
    valuation_upside_pct: p.valuation_upside_pct,
    revenue_upside: p.revenue_upside,
    overall_risk_score: p.overall_risk_score,
    risk_level: p.risk_level,
    total_investment: p.total_investment,
  };
}

/**
 * GET /api/acquisition-scanner
 * Query params: industry, min_valuation, max_valuation, min_data_maturity, max_data_maturity, min_ai_maturity, max_ai_maturity, save (optional "true" to persist)
 * Returns ranked acquisition targets for the current user's portfolio. Auth required.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const industry = url.searchParams.get('industry')?.trim() || null;
    const minV = url.searchParams.get('min_valuation');
    const maxV = url.searchParams.get('max_valuation');
    const minData = url.searchParams.get('min_data_maturity');
    const maxData = url.searchParams.get('max_data_maturity');
    const minAi = url.searchParams.get('min_ai_maturity');
    const maxAi = url.searchParams.get('max_ai_maturity');
    const save = url.searchParams.get('save') === 'true';

    const filters: AcquisitionScannerFilters = {
      industry: industry || undefined,
      min_valuation: minV != null && minV !== '' ? Number(minV) : undefined,
      max_valuation: maxV != null && maxV !== '' ? Number(maxV) : undefined,
      min_data_maturity: minData != null && minData !== '' ? Number(minData) : undefined,
      max_data_maturity: maxData != null && maxData !== '' ? Number(maxData) : undefined,
      min_ai_maturity: minAi != null && minAi !== '' ? Number(minAi) : undefined,
      max_ai_maturity: maxAi != null && maxAi !== '' ? Number(maxAi) : undefined,
    };

    const data = await getPortfolioIntelligenceData(session.user.id, industry);
    const candidates: AcquisitionCandidate[] = data.companies.map(toCandidate);
    const filtered = apply_acquisition_filters(candidates, filters);
    const undervalued = identify_undervalued_companies(filtered);
    const candidatesByOrg = new Map(candidates.map((c) => [c.organisation_id, c]));
    const targets = score_acquisition_targets(undervalued, candidatesByOrg);

    if (save && targets.length > 0) {
      const userId = session.user.id;
      for (const t of targets) {
        await query(
          `INSERT INTO acquisition_opportunities (organisation_id, undervaluation_score, acquisition_attractiveness_score, details, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            t.organisation_id,
            t.undervaluation_score,
            t.acquisition_attractiveness_score,
            JSON.stringify({
              name: t.name,
              industry: t.industry,
              current_valuation: t.current_valuation,
              potential_valuation: t.potential_valuation,
              valuation_upside_pct: t.valuation_upside_pct,
              rationale: t.rationale,
            }),
            userId,
          ]
        );
      }
    }

    return NextResponse.json({
      targets,
      industries: data.industries,
      filters_applied: filters,
    });
  } catch (e) {
    console.error('Acquisition scanner error:', e);
    return NextResponse.json(
      { error: 'Failed to run acquisition scanner' },
      { status: 500 }
    );
  }
}
