import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { DataMaturityScoringService } from '@/lib/scoring-engine';
import type { DataMaturityAuditInputs } from '@/lib/scoring-engine-types';

/** POST /api/v1/organizations/{org_id}/scoring/data-maturity — Calculate Data Maturity Score from raw audit inputs */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(req, organisationId, async () => {
    try {
      const body = await req.json().catch(() => ({}));
      const inputs: DataMaturityAuditInputs = {
        collection: body?.collection ?? {},
        storage: body?.storage ?? {},
        integration: body?.integration ?? {},
        governance: body?.governance ?? {},
        accessibility: body?.accessibility ?? {},
      };
      const service = new DataMaturityScoringService();
      const result = service.calculate(inputs);
      return NextResponse.json(result);
    } catch (e) {
      console.error('Data maturity scoring error:', e);
      return apiError('Data maturity scoring failed', 500);
    }
  });
}
