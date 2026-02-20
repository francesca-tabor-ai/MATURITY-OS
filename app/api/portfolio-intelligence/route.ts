import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {
  getPortfolioIntelligenceData,
  analyzePortfolioPerformance,
} from '@/lib/portfolio-intelligence-service';
import { analyze_maturity_distribution } from '@/lib/maturity-distribution-service';

const BIN_SIZE = 10;
const BINS = Array.from({ length: 10 }, (_, i) => ({
  min: i * BIN_SIZE,
  max: (i + 1) * BIN_SIZE,
  label: `${i * BIN_SIZE}-${(i + 1) * BIN_SIZE}`,
}));

function scoresToHistogram(scores: number[]): { bin: string; count: number }[] {
  const counts = BINS.map(() => 0);
  for (const s of scores) {
    const i = Math.min(Math.floor(s / BIN_SIZE), BINS.length - 1);
    counts[i]++;
  }
  return BINS.map((b, i) => ({ bin: b.label, count: counts[i] }));
}

/**
 * GET /api/portfolio-intelligence
 * Returns aggregated portfolio data and performance for the current user (investor).
 * Optional query: ?industry= to filter portfolio by organisation industry.
 * Only authorized users can access their own portfolio data.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const industryParam = url.searchParams.get('industry');
    const industryFilter = industryParam?.trim() || null;

    const data = await getPortfolioIntelligenceData(session.user.id, industryFilter);
    const performance = analyzePortfolioPerformance(data, { topN: 5 });

    const dataScores = data.companies
      .map((c) => c.data_maturity_index)
      .filter((v): v is number => v != null);
    const aiScores = data.companies
      .map((c) => c.ai_maturity_score)
      .filter((v): v is number => v != null);
    const dataStats = analyze_maturity_distribution(dataScores);
    const aiStats = analyze_maturity_distribution(aiScores);

    return NextResponse.json({
      data,
      performance,
      distribution: {
        data_histogram: scoresToHistogram(dataScores),
        ai_histogram: scoresToHistogram(aiScores),
        data_stats: dataStats,
        ai_stats: aiStats,
      },
    });
  } catch (e) {
    console.error('Portfolio intelligence error:', e);
    return NextResponse.json(
      { error: 'Failed to load portfolio intelligence' },
      { status: 500 }
    );
  }
}
