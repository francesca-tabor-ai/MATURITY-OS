<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3a090cbd-4aeb-4046-8a05-98a65377ba3b

## Run Locally

**Prerequisites:** Node.js, PostgreSQL (for Identity & Organisation Management).

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and set:
   - `DATABASE_URL` – PostgreSQL connection string
   - `NEXTAUTH_URL` – e.g. `http://localhost:3000`
   - `NEXTAUTH_SECRET` – random string (e.g. `openssl rand -base64 32`)
   - Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `GITHUB_ID` / `GITHUB_SECRET` for OAuth
   - Optional: `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` for password reset and team invites
3. Apply the database schema: `psql $DATABASE_URL -f scripts/schema-identity.sql`
4. Run the app: `npm run dev`

### Core Module 0.1 – Identity & Organisation Management

- **Auth:** NextAuth.js with email/password (bcrypt), Google OAuth, GitHub OAuth; login, register, forgot/reset password.
- **RBAC:** Roles Executive, Analyst, Investor, Consultant; middleware protects dashboard and org routes.
- **Organisations:** CRUD, multi-org membership, switch active org; profile fields (company size, industry, revenue, geography, employee count).
- **Team:** Invite by email (SendGrid optional; without it, invite links are logged server-side for dev), accept at `/invite/accept?token=...`; team table and role management.

Deploy to Vercel with the same env vars; use [vercel.json](vercel.json) for security headers.
