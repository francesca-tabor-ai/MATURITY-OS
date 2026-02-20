import { NextResponse } from 'next/server';
import { withV1OrgAuth, apiError } from '@/lib/api-gateway';
import { queryOne } from '@/lib/db';

/** GET /api/v1/organizations/{org_id}/roadmap/latest — Retrieve latest roadmap */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id: organisationId } = await params;
  return withV1OrgAuth(_req, organisationId, async (_, orgId) => {
    try {
      const row = await queryOne(
        `SELECT id, generation_date, roadmap, inputs
         FROM transformation_roadmaps
         WHERE organisation_id = $1
         ORDER BY generation_date DESC
         LIMIT 1`,
        [orgId]
      );
      if (!row) return NextResponse.json({ roadmap: null, message: 'No roadmap found' });
      return NextResponse.json(row);
    } catch (e) {
      console.error('Roadmap latest error:', e);
      return apiError('Failed to retrieve roadmap', 500);
    }
  });
}
