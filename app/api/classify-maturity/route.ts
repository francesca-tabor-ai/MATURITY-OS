import { NextResponse } from 'next/server';
import { classifyMaturity } from '@/lib/maturity-classification-engine';

/**
 * POST /api/classify-maturity
 * Body: { data_maturity_index: number, ai_maturity_score: number }
 * Returns classification result (no storage). Input validation and error handling.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dataMaturityIndex = Number(body?.data_maturity_index);
    const aiMaturityScore = Number(body?.ai_maturity_score);

    if (Number.isNaN(dataMaturityIndex) || Number.isNaN(aiMaturityScore)) {
      return NextResponse.json(
        { error: 'data_maturity_index and ai_maturity_score must be numbers' },
        { status: 400 }
      );
    }
    if (dataMaturityIndex < 0 || dataMaturityIndex > 100 || aiMaturityScore < 0 || aiMaturityScore > 100) {
      return NextResponse.json(
        { error: 'data_maturity_index and ai_maturity_score must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = classifyMaturity(dataMaturityIndex, aiMaturityScore);
    return NextResponse.json(result);
  } catch (e) {
    console.error('Classify maturity error:', e);
    return NextResponse.json({ error: 'Classification failed' }, { status: 500 });
  }
}

/**
 * GET /api/classify-maturity?data_maturity_index=50&ai_maturity_score=60
 * Query params: data_maturity_index, ai_maturity_score. Returns classification (no storage).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dataMaturityIndex = Number(searchParams.get('data_maturity_index'));
    const aiMaturityScore = Number(searchParams.get('ai_maturity_score'));

    if (Number.isNaN(dataMaturityIndex) || Number.isNaN(aiMaturityScore)) {
      return NextResponse.json(
        { error: 'Query params data_maturity_index and ai_maturity_score required (0-100)' },
        { status: 400 }
      );
    }
    if (dataMaturityIndex < 0 || dataMaturityIndex > 100 || aiMaturityScore < 0 || aiMaturityScore > 100) {
      return NextResponse.json(
        { error: 'Scores must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = classifyMaturity(dataMaturityIndex, aiMaturityScore);
    return NextResponse.json(result);
  } catch (e) {
    console.error('Classify maturity error:', e);
    return NextResponse.json({ error: 'Classification failed' }, { status: 500 });
  }
}
