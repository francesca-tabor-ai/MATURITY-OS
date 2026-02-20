-- Core Module 0.1: Identity & Organisation Management
-- PostgreSQL schema for MATURITY OS™

-- Roles (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('Executive', 'Full access to strategy, dashboards, and org settings'),
  ('Analyst', 'Access to audits, data, and reports'),
  ('Investor', 'Access to portfolio and valuation views'),
  ('Consultant', 'Access to assessments and recommendations')
ON CONFLICT (name) DO NOTHING;

-- Users (auth + profile)
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) NOT NULL UNIQUE,
  email_verified TIMESTAMPTZ,
  password_hash  VARCHAR(255),
  name           VARCHAR(255),
  image          TEXT,
  provider        VARCHAR(50),
  provider_id     VARCHAR(255),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- Organisations
CREATE TABLE IF NOT EXISTS organisations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE,
  company_size  VARCHAR(50),
  industry      VARCHAR(100),
  revenue       VARCHAR(50),
  geography     VARCHAR(100),
  employee_count INTEGER,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organisations_slug ON organisations(slug);

-- User-Organisation (many-to-many) with role per org
CREATE TABLE IF NOT EXISTS user_organisations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  role_id         UUID NOT NULL REFERENCES roles(id),
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organisation_id)
);

CREATE INDEX IF NOT EXISTS idx_user_organisations_user ON user_organisations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organisations_org ON user_organisations(organisation_id);

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL,
  role_id         UUID NOT NULL REFERENCES roles(id),
  token           VARCHAR(255) NOT NULL UNIQUE,
  invited_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, email)
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Sessions (optional: for NextAuth adapter; NextAuth can use its own table)
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Accounts (OAuth providers for NextAuth)
CREATE TABLE IF NOT EXISTS accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(50),
  provider          VARCHAR(50),
  provider_account_id VARCHAR(255),
  refresh_token     TEXT,
  access_token      TEXT,
  expires_at        BIGINT,
  token_type        VARCHAR(50),
  scope             TEXT,
  id_token          TEXT,
  session_state     VARCHAR(255),
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);

-- Verification tokens (e.g. password reset, email verify)
CREATE TABLE IF NOT EXISTS verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  VARCHAR(255) NOT NULL,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires     TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
