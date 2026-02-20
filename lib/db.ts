import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export type RoleName = 'Executive' | 'Analyst' | 'Investor' | 'Consultant';

export interface User {
  id: string;
  email: string;
  email_verified: Date | null;
  password_hash: string | null;
  name: string | null;
  image: string | null;
  provider: string | null;
  provider_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string | null;
  company_size: string | null;
  industry: string | null;
  revenue: string | null;
  geography: string | null;
  employee_count: number | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
}

export interface UserOrganisation {
  id: string;
  user_id: string;
  organisation_id: string;
  role_id: string;
  is_default: boolean;
  role_name?: string;
}

export interface Invitation {
  id: string;
  organisation_id: string;
  email: string;
  role_id: string;
  token: string;
  invited_by: string | null;
  expires_at: Date;
  accepted_at: Date | null;
  role_name?: string;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return (res.rows as T[]) ?? [];
  } finally {
    client.release();
  }
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;
