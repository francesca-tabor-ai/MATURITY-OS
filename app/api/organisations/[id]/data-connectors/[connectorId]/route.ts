import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import type { ConnectorType, ConnectionDetails, DataConnectorRecord } from '@/lib/data-connectors/types';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

function maskSecrets(details: ConnectionDetails): ConnectionDetails {
  if (details.type === 'snowflake' && details.snowflake?.password)
    return { ...details, snowflake: { ...details.snowflake, password: '********' } };
  if (details.type === 'aws')
    return { type: 'aws', aws: { ...details.aws, access_key_id: details.aws.access_key_id ? '********' : undefined, secret_access_key: details.aws.secret_access_key ? '********' : undefined } };
  if (details.type === 'salesforce')
    return { type: 'salesforce', salesforce: { ...details.salesforce, client_secret: details.salesforce.client_secret ? '********' : undefined, access_token: details.salesforce.access_token ? '********' : undefined } };
  return details;
}

function parseConnectionDetails(type: ConnectorType, body: unknown): ConnectionDetails | null {
  if (type === 'snowflake' && body && typeof body === 'object' && 'account' in body && 'username' in body) {
    const b = body as Record<string, unknown>;
    return {
      type: 'snowflake',
      snowflake: {
        account: String(b.account),
        username: String(b.username),
        password: b.password != null && String(b.password) !== '********' ? String(b.password) : undefined,
        warehouse: b.warehouse != null ? String(b.warehouse) : undefined,
        database: b.database != null ? String(b.database) : undefined,
        schema: b.schema != null ? String(b.schema) : undefined,
        role: b.role != null ? String(b.role) : undefined,
      },
    };
  }
  if (type === 'aws' && body && typeof body === 'object' && 'region' in body) {
    const b = body as Record<string, unknown>;
    return {
      type: 'aws',
      aws: {
        region: String(b.region),
        access_key_id: b.access_key_id != null && String(b.access_key_id) !== '********' ? String(b.access_key_id) : undefined,
        secret_access_key: b.secret_access_key != null && String(b.secret_access_key) !== '********' ? String(b.secret_access_key) : undefined,
        s3_buckets: Array.isArray(b.s3_buckets) ? b.s3_buckets.map(String) : undefined,
        redshift_cluster: b.redshift_cluster != null ? String(b.redshift_cluster) : undefined,
      },
    };
  }
  if (type === 'salesforce' && body && typeof body === 'object' && 'instance_url' in body) {
    const b = body as Record<string, unknown>;
    return {
      type: 'salesforce',
      salesforce: {
        instance_url: String(b.instance_url),
        client_id: b.client_id != null ? String(b.client_id) : undefined,
        client_secret: b.client_secret != null && String(b.client_secret) !== '********' ? String(b.client_secret) : undefined,
        refresh_token: b.refresh_token != null ? String(b.refresh_token) : undefined,
        access_token: b.access_token != null && String(b.access_token) !== '********' ? String(b.access_token) : undefined,
      },
    };
  }
  return null;
}

/** GET: single connector (masked details) */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; connectorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId, connectorId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const row = await queryOne<{
    id: string;
    organisation_id: string;
    connector_type: string;
    name: string;
    connection_details: unknown;
    last_sync_at: string | null;
    last_sync_status: string | null;
    last_sync_error: string | null;
    created_at: string;
    updated_at: string;
  }>(
    'SELECT id, organisation_id, connector_type, name, connection_details, last_sync_at, last_sync_status, last_sync_error, created_at, updated_at FROM data_connectors WHERE id = $1 AND organisation_id = $2',
    [connectorId, organisationId]
  );

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const conn: DataConnectorRecord = {
    id: row.id,
    organisation_id: row.organisation_id,
    connector_type: row.connector_type as ConnectorType,
    name: row.name,
    connection_details: maskSecrets(row.connection_details as ConnectionDetails),
    last_sync_at: row.last_sync_at,
    last_sync_status: row.last_sync_status as 'ok' | 'failed' | null,
    last_sync_error: row.last_sync_error,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
  return NextResponse.json(conn);
}

/** PATCH: update connector name or connection_details */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; connectorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId, connectorId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await queryOne<{ connector_type: string; connection_details: unknown }>(
    'SELECT connector_type, connection_details FROM data_connectors WHERE id = $1 AND organisation_id = $2',
    [connectorId, organisationId]
  );
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const type = existing.connector_type as ConnectorType;
  const connectionDetails = body?.connection_details != null
    ? parseConnectionDetails(type, body.connection_details)
    : (existing.connection_details as ConnectionDetails);
  if (!connectionDetails) {
    return NextResponse.json({ error: 'Invalid connection_details' }, { status: 400 });
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
  const values: unknown[] = [connectorId, organisationId, JSON.stringify(connectionDetails)];
  const setClause = name !== undefined
    ? 'connection_details = $3, updated_at = NOW(), name = $4'
    : 'connection_details = $3, updated_at = NOW()';
  if (name !== undefined) values.push(name);

  const row = await queryOne<{ updated_at: string }>(
    `UPDATE data_connectors SET ${setClause} WHERE id = $1 AND organisation_id = $2 RETURNING updated_at`,
    values
  );
  if (!row) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  const updated = await queryOne<DataConnectorRecord & { connection_details: unknown }>(
    'SELECT id, organisation_id, connector_type, name, connection_details, last_sync_at, last_sync_status, last_sync_error, created_at, updated_at FROM data_connectors WHERE id = $1',
    [connectorId]
  );
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  updated.connection_details = maskSecrets(updated.connection_details as ConnectionDetails);
  return NextResponse.json(updated);
}

/** DELETE: remove connector */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; connectorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId, connectorId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const row = await queryOne(
    'DELETE FROM data_connectors WHERE id = $1 AND organisation_id = $2 RETURNING id',
    [connectorId, organisationId]
  );
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
