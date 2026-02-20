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
3. Apply the database schemas:  
   `psql $DATABASE_URL -f scripts/schema-identity.sql`  
   `psql $DATABASE_URL -f scripts/schema-data-maturity.sql`  
   `psql $DATABASE_URL -f scripts/schema-ai-maturity.sql`  
   `psql $DATABASE_URL -f scripts/schema-maturity-classification.sql`  
   `psql $DATABASE_URL -f scripts/schema-financial-impact.sql`  
   `psql $DATABASE_URL -f scripts/schema-roi-investment.sql`  
   `psql $DATABASE_URL -f scripts/schema-risk-assessment.sql`  
   `psql $DATABASE_URL -f scripts/schema-transformation-roadmap.sql`  
   `psql $DATABASE_URL -f scripts/schema-capability-gaps.sql`
4. Run the app: `npm run dev`

### Core Module 0.1 – Identity & Organisation Management

- **Auth:** NextAuth.js with email/password (bcrypt), Google OAuth, GitHub OAuth; login, register, forgot/reset password.
- **RBAC:** Roles Executive, Analyst, Investor, Consultant; middleware protects dashboard and org routes.
- **Organisations:** CRUD, multi-org membership, switch active org; profile fields (company size, industry, revenue, geography, employee count).
- **Team:** Invite by email (SendGrid optional; without it, invite links are logged server-side for dev), accept at `/invite/accept?token=...`; team table and role management.

### Core Module 0.2 – Data Maturity Audit Engine™

- **Engine:** Rule-based scoring for Data Collection, Storage, Integration, Governance, and Accessibility (TypeScript in `lib/data-maturity-engine.ts`). Produces Data Maturity Stage (1–6), Confidence Score (0–1), and Maturity Index (0–100).
- **Storage:** `data_audit_inputs` (raw JSON per category), `data_maturity_results` (scores and aggregates); see `scripts/schema-data-maturity.sql` and `scripts/queries-data-maturity.sql`.
- **API:** `POST/GET /api/organisations/[id]/data-audit` (submit inputs + run audit, list results), `GET /api/organisations/[id]/data-audit/[resultId]` (single result with inputs).
- **UI:** Organisation → “Data Maturity Audit”: 5-step form (one per category), then run audit; dashboard with stage, index gauge, confidence bar, and category score bars; audit history with “View” for past results.

### Core Module 0.3 – AI Maturity Audit Engine™

- **Engine:** Rule-based scoring for Automation Maturity, AI Usage (predictive, recommendations, NLP, computer vision), and Deployment Maturity (experimental vs production, scope, decision automation). Produces AI Maturity Stage (1–7) and AI Maturity Score (0–100). See `lib/ai-maturity-engine.ts` and `lib/ai-maturity-types.ts`.
- **Storage:** `ai_audit_inputs`, `ai_maturity_results`; see `scripts/schema-ai-maturity.sql` and `scripts/queries-ai-maturity.sql`.
- **API:** `POST/GET /api/organisations/[id]/ai-audit`, `GET /api/organisations/[id]/ai-audit/[resultId]`.
- **UI:** Organisation → “AI Maturity Audit”: 3-step form (Automation, AI Usage, Deployment), run audit; dashboard with stage, score gauge, and category bars; audit history.

### Core Module 0.4 – Maturity Classification Engine™

- **Engine:** Maps Data Maturity Index (0–100) and AI Maturity Score (0–100) to a matrix position, human-readable classification (e.g. “Intelligent Operator”, “Data-Driven Innovator”), risk (Low/Medium/High), and opportunity (e.g. “AI Adoption Acceleration”). Rule engine loads from `lib/maturity-classification-rules.json` for easy updates. See `lib/maturity-classification-engine.ts`.
- **Storage:** `maturity_classifications` table; see `scripts/schema-maturity-classification.sql` and `scripts/queries-maturity-classification.sql`.
- **API:** `GET/POST /api/classify-maturity` (query or body: `data_maturity_index`, `ai_maturity_score`) returns classification only. `POST/GET /api/organisations/[id]/classify` runs classification (from latest audits or manual scores), stores result, returns and lists history.
- **UI:** Organisation → “Maturity Classification”: run from latest audits or enter scores; `MaturityClassificationDisplay` (classification, matrix coords, risk, opportunity) and interactive 2D matrix with position marker; classification history table.

### Module 1.1 – Financial Impact Engine™

- **Engine:** Revenue upside, profit margin expansion, and cost reduction from data/AI maturity. Rule-based model using maturity gap vs. 100; industry benchmarks scale results. See `lib/financial-impact-engine.ts` and `lib/industry-benchmarks.ts`.
- **Storage:** `financial_impact_results` (inputs + outputs); see `scripts/schema-financial-impact.sql` and `scripts/queries-financial-impact.sql`.
- **API:** `POST/GET /api/organisations/[id]/financial-impact` (run with body inputs, list history).
- **UI:** Organisation → “Financial Impact”: form (revenue, profit margin, headcount, optional operational cost, industry benchmark, data/AI maturity scores); prefill maturity from latest audits; `FinancialImpactDashboard` (revenue upside, margin expansion value, cost reduction, breakdown bars, total impact); previous runs list.

### Module 1.2 – ROI & Investment Calculator™

- **Engine:** Required investment (data + AI) from maturity gap (cost per point); expected ROI = (benefits / investment) as % and multiplier; payback period = investment / annual benefits. `ROIInvestmentCalculator` with `scenario(targetData, targetAi)` for scenario analysis. See `lib/roi-investment-engine.ts`.
- **Storage:** `roi_investment_results`; see `scripts/schema-roi-investment.sql` and `scripts/queries-roi-investment.sql`.
- **API:** `POST/GET /api/organisations/[id]/roi-investment`.
- **UI:** Organisation → “ROI & Investment”: form (current/target data & AI maturity 0–100, estimated financial benefits, optional annual benefits); prefill from latest Data/AI audits and Financial Impact; `ROIResultsDisplay` (total investment, ROI %, multiplier, payback years/months, investment breakdown bar); previous scenarios list.

### Module 1.3 – Risk Assessment Engine™

- **Engine:** Four risk categories (AI Misalignment, Infrastructure, Operational, Strategic) scored 0–100; overall risk score (0–100) and qualitative level (LOW &lt; 35, MEDIUM &lt; 65, HIGH). Equal weights; summary of high-risk areas. See `lib/risk-assessment-engine.ts` and `lib/risk-assessment-types.ts`.
- **Storage:** `risk_assessments` (organisation_id, category scores, overall_score, risk_level, details/inputs JSONB); see `scripts/schema-risk-assessment.sql` and `scripts/queries-risk-assessment.sql`.
- **API:** `POST/GET /api/organisations/[id]/risk-assessment` (run assessment from form body, list history).
- **UI:** Organisation → “Risk Assessment”: 4-step form (AI Misalignment, Infrastructure, Operational, Strategic); `RiskAssessmentDisplay` (overall score gauge, risk level badge, category bars); assessment history.

### Module 2.1 – Transformation Roadmap Generator™

- **Engine:** Phased roadmap from current/target data & AI maturity, optional capability gaps (Module 2.2) and financial impact (Module 1.1). `generate_roadmap(inputs)` produces phases (Foundation, Build, Scale) with actions, cost, and projected impact; `prioritize_actions(actions, strategy)` supports highest ROI first, lowest cost first, strategic alignment. See `lib/roadmap-engine.ts` and `lib/roadmap-types.ts`.
- **Storage:** `transformation_roadmaps` (organisation_id, generation_date, inputs/roadmap JSONB); see `scripts/schema-transformation-roadmap.sql` and `scripts/queries-transformation-roadmap.sql`.
- **API:** `POST/GET /api/organisations/[id]/roadmap` (generate and store roadmap, list history).
- **UI:** Organisation → “Transformation Roadmap”: form (current/target maturity, prioritization, optional financial impact); `RoadmapDisplay` (timeline of phases, actions, cost and impact); roadmap history with switch.

### Module 2.2 – Capability Gap Analysis™

- **Engine:** Compares current data/AI maturity (Module 0.2 / 0.3) to ideal capabilities; `identify_capability_gaps(inputs)` returns missing capabilities (e.g. data pipeline automation, governance framework, model deployment); `prioritize_gaps(gaps)` assigns High/Medium/Low and groups into themes (Data foundation, Governance & quality, AI & automation, etc.). See `lib/capability-gap-engine.ts` and `lib/capability-gap-types.ts`.
- **Storage:** `capability_gaps` (organisation_id, analysis_date, gap_description, priority_level, grouped_theme, dimension); see `scripts/schema-capability-gaps.sql` and `scripts/queries-capability-gaps.sql`.
- **API:** `POST/GET /api/organisations/[id]/capability-gaps` (run analysis from data/AI maturity, list stored gaps).
- **UI:** Organisation → “Capability Gap Analysis”: run from latest audits; `CapabilityGapDisplay` (radar chart current vs ideal, gaps by theme with priority, tag cloud); analysis history.

### Module 2.3 – Executive Dashboard™

- **Service:** Aggregates latest data from Data Maturity (0.2), AI Maturity (0.3), Classification (0.4), Financial Impact (1.1), ROI (1.2), Risk Assessment (1.3), and Transformation Roadmap (2.1). `getExecutiveDashboardData(orgId)` fetches from all result tables; `prepare_dashboard_data()` formats numbers and structures payload for the UI. See `lib/executive-dashboard-service.ts` and `lib/executive-dashboard-types.ts`.
- **Queries:** `scripts/queries-executive-dashboard.sql` (latest per org, optional historical trends).
- **API:** `GET /api/organisations/[id]/executive-dashboard` returns a single JSON with maturity, classification, financial, roi, risk, roadmap.
- **UI:** Organisation → “Executive Dashboard”: `ExecutiveDashboard` (KPI cards: Data/AI maturity, financial impact, risk score; maturity quadrant; financial breakdown bars; risk meter and category bars; roadmap summary; optional ROI). Fetches all data from one endpoint.

Deploy to Vercel with the same env vars; use [vercel.json](vercel.json) for security headers.
