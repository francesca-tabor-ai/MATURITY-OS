import { NextResponse } from 'next/server';

/** GET /api/v1/openapi — OpenAPI 3.0 spec for MATURITY OS™ API Layer */
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'MATURITY OS™ API',
      description: 'Central API layer for MATURITY OS™: data/AI maturity, financial impact, risk, roadmap, and simulations. Authenticate via NextAuth session (cookie).',
      version: '1.0.0',
    },
    servers: [{ url: `${baseUrl}/api/v1`, description: 'API v1' }],
    security: [{ sessionCookie: [] }],
    paths: {
      '/organizations/{org_id}/data-maturity/audit': {
        post: {
          summary: 'Submit data maturity audit',
          operationId: 'postDataMaturityAudit',
          tags: ['Data Maturity'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { audit_period: { type: 'string' }, collection: { type: 'object' }, storage: { type: 'object' }, integration: { type: 'object' }, governance: { type: 'object' }, accessibility: { type: 'object' } } } } } },
          responses: { '200': { description: 'Audit result' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/data-maturity/score': {
        get: {
          summary: 'Get latest data maturity score',
          operationId: 'getDataMaturityScore',
          tags: ['Data Maturity'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Score, stage, confidence' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/data-maturity/history': {
        get: {
          summary: 'Get data maturity history',
          operationId: 'getDataMaturityHistory',
          tags: ['Data Maturity'],
          security: [{ sessionCookie: [] }],
          parameters: [
            { name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          ],
          responses: { '200': { description: 'List of historical scores' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/ai-maturity/audit': {
        post: {
          summary: 'Submit AI maturity audit',
          operationId: 'postAIMaturityAudit',
          tags: ['AI Maturity'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { audit_period: { type: 'string' }, automation: { type: 'object' }, ai_usage: { type: 'object' }, deployment: { type: 'object' } } } } } },
          responses: { '200': { description: 'Audit result' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/ai-maturity/score': {
        get: {
          summary: 'Get latest AI maturity score',
          operationId: 'getAIMaturityScore',
          tags: ['AI Maturity'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Score and stage' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/ai-maturity/history': {
        get: {
          summary: 'Get AI maturity history',
          operationId: 'getAIMaturityHistory',
          tags: ['AI Maturity'],
          security: [{ sessionCookie: [] }],
          parameters: [
            { name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'limit', in: 'query' },
            { name: 'offset', in: 'query' },
          ],
          responses: { '200': { description: 'List of historical scores' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/financial-impact/calculate': {
        post: {
          summary: 'Calculate financial impact',
          operationId: 'postFinancialImpactCalculate',
          tags: ['Financial Impact'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { revenue: { type: 'number' }, profit_margin_pct: { type: 'number' }, headcount: { type: 'integer' }, data_maturity_score: { type: 'number' }, ai_maturity_score: { type: 'number' }, industry_benchmark_id: { type: 'string' } } } } } },
          responses: { '200': { description: 'Calculation result' }, '400': { description: 'Invalid input' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/financial-impact/results': {
        get: {
          summary: 'Get latest financial impact results',
          operationId: 'getFinancialImpactResults',
          tags: ['Financial Impact'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Latest result' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/financial-model/calculate': {
        post: {
          summary: 'Run financial model (revenue, cost, profit impact orchestration)',
          operationId: 'postFinancialModelCalculate',
          tags: ['Financial Modelling'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { revenue: { type: 'number' }, profit_margin_pct: { type: 'number' }, headcount: { type: 'integer' }, data_maturity_index: { type: 'number' }, ai_maturity_score: { type: 'number' }, operational_cost: { type: 'number' }, industry_growth_rate_pct: { type: 'number' }, tax_rate_pct: { type: 'number' }, industry_benchmark_id: { type: 'string' }, persist: { type: 'boolean' } } } } } },
          responses: { '200': { description: 'Financial impact report (revenue_impact, cost_impact, profit_impact, summary)' }, '400': { description: 'Invalid input' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/roi-calculator/calculate': {
        post: {
          summary: 'Calculate ROI and payback',
          operationId: 'postROICalculatorCalculate',
          tags: ['ROI Calculator'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { current_data_maturity: { type: 'number' }, target_data_maturity: { type: 'number' }, current_ai_maturity: { type: 'number' }, target_ai_maturity: { type: 'number' }, estimated_financial_benefits: { type: 'number' }, annual_benefits: { type: 'number' } } } } } },
          responses: { '200': { description: 'ROI result' }, '400': { description: 'Invalid input' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/roi-calculator/results': {
        get: {
          summary: 'Get latest ROI results',
          operationId: 'getROICalculatorResults',
          tags: ['ROI Calculator'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Latest result' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/risk-assessment/calculate': {
        post: {
          summary: 'Calculate risk assessment',
          operationId: 'postRiskAssessmentCalculate',
          tags: ['Risk Assessment'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { ai_misalignment: { type: 'object' }, infrastructure: { type: 'object' }, operational: { type: 'object' }, strategic: { type: 'object' } } } } } },
          responses: { '200': { description: 'Risk result' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/risk-assessment/results': {
        get: {
          summary: 'Get latest risk assessment results',
          operationId: 'getRiskAssessmentResults',
          tags: ['Risk Assessment'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Latest result' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/risk-model/calculate': {
        post: {
          summary: 'Run risk model (probability of failure + expected financial loss)',
          operationId: 'postRiskModelCalculate',
          tags: ['Risk Modelling'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { initiative_name: { type: 'string' }, probability_inputs: { type: 'object', properties: { project_complexity: { type: 'string', enum: ['low', 'medium', 'high'] }, team_experience_years: { type: 'number' }, infrastructure_stability_rating: { type: 'number' }, historical_failure_rate: { type: 'number' }, scope_uncertainty: { type: 'number' } } }, loss_inputs: { type: 'object', properties: { direct_cost_if_failure: { type: 'number' }, indirect_cost_if_failure: { type: 'number' }, reputational_damage_estimate: { type: 'number' }, mitigation_cost: { type: 'number' } } }, persist: { type: 'boolean' } } } } } },
          responses: { '200': { description: 'Risk assessment report (probability_of_failure, expected_financial_loss, summary)' }, '400': { description: 'Invalid input' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/roadmap/generate': {
        post: {
          summary: 'Generate transformation roadmap',
          operationId: 'postRoadmapGenerate',
          tags: ['Roadmap'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { current_data_maturity: { type: 'number' }, current_ai_maturity: { type: 'number' }, target_data_maturity: { type: 'number' }, target_ai_maturity: { type: 'number' }, prioritization: { type: 'string', enum: ['highest_roi_first', 'lowest_cost_first', 'strategic_alignment'] }, capability_gaps: { type: 'array' }, financial_impact: { type: 'object' } } } } } },
          responses: { '200': { description: 'Generated roadmap' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/roadmap/latest': {
        get: {
          summary: 'Get latest roadmap',
          operationId: 'getRoadmapLatest',
          tags: ['Roadmap'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Latest roadmap' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/simulate/ai-investment': {
        post: {
          summary: 'Run AI investment simulations',
          operationId: 'postSimulateAIInvestment',
          tags: ['Simulation'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { scenarios: { type: 'array', items: { type: 'object' } }, save: { type: 'boolean' } } } } } },
          responses: { '200': { description: 'Simulation results' }, '400': { description: 'Invalid input' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/organizations/{org_id}/simulate/strategic-decision': {
        post: {
          summary: 'Run strategic decision simulations',
          operationId: 'postSimulateStrategicDecision',
          tags: ['Simulation'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { scenarios: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, parameters: { type: 'object' } } } }, save: { type: 'boolean' } } } } } },
          responses: { '200': { description: 'Outcomes and analysis' }, '400': { description: 'Invalid input' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/investors/{investor_id}/portfolio-summary': {
        get: {
          summary: 'Aggregated portfolio maturity and financial insights',
          operationId: 'getInvestorsPortfolioSummary',
          tags: ['External – Investors'],
          security: [{ sessionCookie: [] }],
          parameters: [{ name: 'investor_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Portfolio summary' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' } },
        },
      },
      '/consultants/{consultant_id}/organization-report/{org_id}': {
        get: {
          summary: 'Comprehensive organisation report',
          operationId: 'getConsultantsOrganizationReport',
          tags: ['External – Consultants'],
          security: [{ sessionCookie: [] }],
          parameters: [
            { name: 'consultant_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'org_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Organisation report' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' }, '404': { description: 'Not found' } },
        },
      },
    },
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth session cookie (sign in via app then use same cookie for API calls)',
        },
      },
    },
  };
  return NextResponse.json(spec);
}
