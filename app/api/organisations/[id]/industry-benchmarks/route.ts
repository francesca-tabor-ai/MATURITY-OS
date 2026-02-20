import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { IndustryBenchmarkEngine } from '@/lib/industry-benchmark-engine';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: run benchmark comparison; optionally pass industry, else use org's industry */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const url = new URL(req.url);
    const industryParam = url.searchParams.get('industry');

    let industry: string | null = industryParam?.trim() || null;
    if (!industry) {
      const org = await queryOne<{ industry: string | null }>(
        'SELECT industry FROM organisations WHERE id = $1',
        [organisationId]
      );
      industry = org?.industry ?? null;
    }

    const engine = new IndustryBenchmarkEngine(organisationId, industry);
    const report = await engine.run();

    const row = await queryOne<{ id: string }>(
      `INSERT INTO organisation_benchmarks (
        organisation_id, industry_used, data_maturity_score, ai_maturity_score,
        industry_data_avg, industry_ai_avg, data_comparison, ai_comparison,
        data_pct_diff, ai_pct_diff, report, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        organisationId,
        report.industry_used,
        report.data.organisation_score,
        report.ai.organisation_score,
        report.data.industry_average,
        report.ai.industry_average,
        report.data.comparison,
        report.ai.comparison,
        report.data.pct_diff,
        report.ai.pct_diff,
        JSON.stringify(report),
        session.user.id,
      ]
    );

    return NextResponse.json({
      id: row?.id,
      ...report,
    });
  } catch (e) {
    console.error('Industry benchmark error:', e);
    return NextResponse.json({ error: 'Benchmark comparison failed' }, { status: 500 });
  }
}
