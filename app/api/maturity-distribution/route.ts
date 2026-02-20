import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { aggregate_maturity_data, runDistributionAnalysis } from '@/lib/maturity-distribution-service';

/** GET: distribution of data/AI maturity across the user's organisations (portfolio). Optional ?industry= filter. */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const industryParam = url.searchParams.get('industry');
    const industryFilter = industryParam?.trim() || null;

    const orgRows = await query<{ id: string; industry: string | null }>(
      `SELECT o.id, o.industry FROM organisations o
       JOIN user_organisations uo ON uo.organisation_id = o.id
       WHERE uo.user_id = $1
         AND ($2::varchar IS NULL OR LOWER(TRIM(o.industry)) = LOWER(TRIM($2)))`,
      [session.user.id, industryFilter]
    );

    const organisationIds = orgRows.map((r) => r.id);
    const aggregated = await aggregate_maturity_data(organisationIds, industryFilter);
    const analysis = runDistributionAnalysis(aggregated);

    const industriesForFilter = await query<{ industry: string | null }>(
      `SELECT DISTINCT o.industry FROM organisations o
       JOIN user_organisations uo ON uo.organisation_id = o.id
       WHERE uo.user_id = $1 AND o.industry IS NOT NULL AND TRIM(o.industry) != ''`,
      [session.user.id]
    );

    return NextResponse.json({
      aggregated: {
        data_scores: aggregated.data_scores,
        ai_scores: aggregated.ai_scores,
        organisation_ids: aggregated.organisation_ids,
        industry_filter: aggregated.industry_filter,
      },
      analysis,
      industries: industriesForFilter.map((r) => r.industry).filter(Boolean) as string[],
    });
  } catch (e) {
    console.error('Maturity distribution error:', e);
    return NextResponse.json({ error: 'Failed to load distribution data' }, { status: 500 });
  }
}
