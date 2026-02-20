import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { runCompetitivePositionAnalysis } from '@/lib/competitive-position-engine';
import type { CompetitorScore } from '@/lib/competitive-position-types';

async function getAccessibleOrgIds(userId: string): Promise<string[]> {
  const rows = await query<{ id: string }>(
    'SELECT organisation_id AS id FROM user_organisations WHERE user_id = $1',
    [userId]
  );
  return rows.map((r) => r.id);
}

async function getLatestMaturity(organisationId: string): Promise<{ data: number; ai: number }> {
  const [dataRow, aiRow] = await Promise.all([
    queryOne<{ maturity_index: number }>(
      'SELECT maturity_index FROM data_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
      [organisationId]
    ),
    queryOne<{ maturity_score: number }>(
      'SELECT maturity_score FROM ai_maturity_results WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 1',
      [organisationId]
    ),
  ]);
  return {
    data: dataRow?.maturity_index != null ? Number(dataRow.maturity_index) : 0,
    ai: aiRow?.maturity_score != null ? Number(aiRow.maturity_score) : 0,
  };
}

/** GET: run competitive position analysis; optional ?competitors=id1,id2 or ?industry= */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;

  const accessible = await getAccessibleOrgIds(session.user.id);
  if (!accessible.includes(organisationId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const url = new URL(req.url);
    const competitorsParam = url.searchParams.get('competitors');
    const industryParam = url.searchParams.get('industry');

    let competitorIds: string[] = [];
    if (competitorsParam?.trim()) {
      competitorIds = competitorsParam.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = competitorIds.filter((id) => !accessible.includes(id));
      if (invalid.length > 0)
        return NextResponse.json({ error: 'Some competitor IDs are not accessible' }, { status: 400 });
    } else {
      const others = accessible.filter((id) => id !== organisationId);
      if (industryParam?.trim()) {
        const withIndustry = await query<{ id: string }>(
          `SELECT id FROM organisations WHERE id = ANY($1::uuid[]) AND LOWER(TRIM(industry)) = LOWER(TRIM($2)) AND id != $3`,
          [others, industryParam.trim(), organisationId]
        );
        competitorIds = withIndustry.map((r) => r.id);
      } else {
        competitorIds = others;
      }
    }

    const [orgMaturity, orgRow] = await Promise.all([
      getLatestMaturity(organisationId),
      queryOne<{ name: string }>('SELECT name FROM organisations WHERE id = $1', [organisationId]),
    ]);

    const competitorScores: CompetitorScore[] = await Promise.all(
      competitorIds.map(async (id) => {
        const m = await getLatestMaturity(id);
        const nameRow = await queryOne<{ name: string }>('SELECT name FROM organisations WHERE id = $1', [id]);
        return {
          organisation_id: id,
          name: nameRow?.name,
          data_maturity: m.data,
          ai_maturity: m.ai,
        };
      })
    );

    const report = runCompetitivePositionAnalysis(
      organisationId,
      orgRow?.name ?? null,
      orgMaturity.data,
      orgMaturity.ai,
      competitorScores
    );

    const industriesRows = await query<{ industry: string | null }>(
      `SELECT DISTINCT o.industry FROM organisations o
       JOIN user_organisations uo ON uo.organisation_id = o.id
       WHERE uo.user_id = $1 AND o.industry IS NOT NULL AND TRIM(o.industry) != ''`,
      [session.user.id]
    );
    const industries = industriesRows.map((r) => r.industry).filter(Boolean) as string[];

    const row = await queryOne<{ id: string }>(
      `INSERT INTO competitive_positions (
        organisation_id, competitive_risk_level, competitive_risk_score,
        competitive_advantage_score, comparison_data, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        organisationId,
        report.competitive_risk_level,
        report.competitive_risk_score,
        report.competitive_advantage_score,
        JSON.stringify(report.comparison_data),
        session.user.id,
      ]
    );

    return NextResponse.json({ id: row?.id, industries, ...report });
  } catch (e) {
    console.error('Competitive position error:', e);
    return NextResponse.json({ error: 'Competitive analysis failed' }, { status: 500 });
  }
}
