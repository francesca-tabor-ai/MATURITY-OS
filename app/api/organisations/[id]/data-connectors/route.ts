import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
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
  if (details.type === 'aws' && (details.aws?.access_key_id || details.aws?.secret_access_key))
    return { type: 'aws', aws: { ...details.aws, access_key_id: details.aws.access_key_id ? '********' : undefined, secret_access_key: details.aws.secret_access_key ? '********' : undefined } };
  if (details.type === 'salesforce' && (details.salesforce?.client_secret || details.salesforce?.access_token))
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
        password: b.password != null ? String(b.password) : undefined,
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
        access_key_id: b.access_key_id != null ? String(b.access_key_id) : undefined,
        secret_access_key: b.secret_access_key != null ? String(b.secret_access_key) : undefined,
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
        client_secret: b.client_secret != null ? String(b.client_secret) : undefined,
        refresh_token: b.refresh_token != null ? String(b.refresh_token) : undefined,
        access_token: b.access_token != null ? String(b.access_token) : undefined,
      },
    };
  }
  return null;
}

/** GET: list data connectors for the organisation (no secrets in response) */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const rows = await query<{
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
      `SELECT id, organisation_id, connector_type, name, connection_details, last_sync_at, last_sync_status, last_sync_error, created_at, updated_at
       FROM data_connectors WHERE organisation_id = $1 ORDER BY updated_at DESC`,
      [organisationId]
    );

    const list: DataConnectorRecord[] = rows.map((r) => ({
      id: r.id,
      organisation_id: r.organisation_id,
      connector_type: r.connector_type as ConnectorType,
      name: r.name,
      connection_details: maskSecrets(r.connection_details as ConnectionDetails),
      last_sync_at: r.last_sync_at,
      last_sync_status: r.last_sync_status as 'ok' | 'failed' | null,
      last_sync_error: r.last_sync_error,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    return NextResponse.json({ connectors: list });
  } catch (e) {
    console.error('Data connectors list error:', e);
    return NextResponse.json({ error: 'Failed to list connectors' }, { status: 500 });
  }
}

/** POST: create a new data connector */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json().catch(() => ({}));
    const connectorType = (body?.connector_type ?? '').toLowerCase();
    if (!['snowflake', 'aws', 'salesforce'].includes(connectorType)) {
      return NextResponse.json({ error: 'Invalid connector_type' }, { status: 400 });
    }

    const connectionDetails = parseConnectionDetails(connectorType as ConnectorType, body?.connection_details ?? body);
    if (!connectionDetails) {
      return NextResponse.json({ error: 'Invalid connection_details for ' + connectorType }, { status: 400 });
    }

    const name = typeof body?.name === 'string' ? body.name.trim() || connectorType : connectorType;

    const row = await queryOne<{ id: string; created_at: string; updated_at: string }>(
      `INSERT INTO data_connectors (organisation_id, connector_type, name, connection_details, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at, updated_at`,
      [organisationId, connectorType, name, JSON.stringify(connectionDetails), session.user.id]
    );

    if (!row) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

    return NextResponse.json({
      id: row.id,
      organisation_id: organisationId,
      connector_type: connectorType,
      name,
      connection_details: maskSecrets(connectionDetails),
      last_sync_at: null,
      last_sync_status: null,
      last_sync_error: null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (e) {
    console.error('Data connector create error:', e);
    return NextResponse.json({ error: 'Failed to create connector' }, { status: 500 });
  }
}
