import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { runDataConnectorPipeline } from '@/lib/data-connectors/pipeline';
import { recordSnapshot } from '@/lib/live-maturity-service';
import type { ConnectionDetails } from '@/lib/data-connectors/types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** POST: run sync for this connector; push metrics to live maturity and update connector status */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; connectorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId, connectorId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const connector = await queryOne<{ connection_details: unknown }>(
    'SELECT connection_details FROM data_connectors WHERE id = $1 AND organisation_id = $2',
    [connectorId, organisationId]
  );
  if (!connector) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const connectionDetails = connector.connection_details as ConnectionDetails;
  const result = await runDataConnectorPipeline(connectionDetails);

  const now = new Date().toISOString();
  if (result.success && result.metrics) {
    await recordSnapshot(
      organisationId,
      {
        data_maturity_index: result.metrics.data_maturity_index,
        ai_maturity_score: result.metrics.ai_maturity_score,
        metrics: result.metrics.metrics,
        source: result.metrics.source,
      },
      session.user.id
    );
    await queryOne(
      `UPDATE data_connectors SET last_sync_at = $1, last_sync_status = 'ok', last_sync_error = NULL, updated_at = NOW() WHERE id = $2 AND organisation_id = $3`,
      [now, connectorId, organisationId]
    );
    return NextResponse.json({ ok: true, metrics: result.metrics });
  }

  await queryOne(
    `UPDATE data_connectors SET last_sync_at = $1, last_sync_status = 'failed', last_sync_error = $2, updated_at = NOW() WHERE id = $3 AND organisation_id = $4`,
    [now, result.error ?? 'Unknown error', connectorId, organisationId]
  );
  return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
}
