import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { query, queryOne } from './db';
import type { RoleName } from './db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: RoleName;
      activeOrganisationId?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: RoleName;
    activeOrganisationId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await queryOne<{ id: string; email: string; name: string | null; password_hash: string }>(
          'SELECT id, email, name, password_hash FROM users WHERE email = $1',
          [credentials.email]
        );
        if (!user?.password_hash) return null;
        const ok = await bcrypt.compare(credentials.password, user.password_hash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user: authUser, account }) {
      if (!authUser.email) return false;
      const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [authUser.email]);
      if (existing) {
        if (account?.provider !== 'credentials' && account?.provider) {
          await query(
            `INSERT INTO accounts (user_id, type, provider, provider_account_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (provider, provider_account_id) DO UPDATE SET access_token = EXCLUDED.access_token`,
            [existing.id, account.type, account.provider, account.providerAccountId]
          );
        }
        return true;
      }
      if (account?.provider === 'credentials') return true;
      const insert = await queryOne<{ id: string }>(
        `INSERT INTO users (email, name, image, provider, provider_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [authUser.email, authUser.name ?? null, authUser.image ?? null, account?.provider ?? null, account?.providerAccountId ?? null]
      );
      if (insert && account?.provider && account?.providerAccountId) {
        await query(
          `INSERT INTO accounts (user_id, type, provider, provider_account_id) VALUES ($1, $2, $3, $4)`,
          [insert.id, account.type, account.provider, account.providerAccountId]
        );
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) token.id = user.id;
      if (trigger === 'update' && session?.activeOrganisationId !== undefined) {
        token.activeOrganisationId = session.activeOrganisationId;
      }
      if (token.id) {
        const roleRow = await queryOne<{ role_name: string; organisation_id: string }>(
          `SELECT r.name AS role_name, uo.organisation_id FROM user_organisations uo
           JOIN roles r ON r.id = uo.role_id
           WHERE uo.user_id = $1
           ORDER BY uo.is_default DESC LIMIT 1`,
          [token.id]
        );
        if (roleRow) {
          token.role = roleRow.role_name as RoleName;
          if (token.activeOrganisationId === undefined) token.activeOrganisationId = roleRow.organisation_id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.role = token.role;
        session.user.activeOrganisationId = token.activeOrganisationId ?? null;
      }
      return session;
    },
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
