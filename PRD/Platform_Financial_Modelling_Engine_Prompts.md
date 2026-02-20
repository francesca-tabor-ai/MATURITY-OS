# Prompt Engineering: Platform Infrastructure — Financial Modelling Engine

## 1. Component Description
The Financial Modelling Engine is a core platform infrastructure component responsible for calculating the financial impacts of various maturity levels and transformation initiatives. It provides the underlying calculations for revenue impact, cost impact, and profit impact, feeding into modules like the Financial Impact Engine and ROI & Investment Calculator.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel (as backend serverless functions)
*   **Media/Video:** Runway (Not directly applicable, but outputs might be visualized)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Revenue Impact Calculation Service
```
Develop a Python microservice `RevenueImpactService` that encapsulates the logic for calculating potential revenue impact. This service should expose an API endpoint that accepts an organisation's current revenue, data maturity index, AI maturity score, and relevant industry growth rates. It should return the projected revenue increase and total potential revenue. Ensure the service is scalable and handles various economic models.
```

### 3.2 Cost Impact Calculation Service
```
Create a Python microservice `CostImpactService` that encapsulates the logic for calculating potential cost reductions. This service should expose an API endpoint that accepts an organisation's current operational costs, headcount, data maturity index, and AI maturity score. It should return the estimated cost savings and areas of potential reduction. Focus on efficiency and accuracy in cost modeling.
```

### 3.3 Profit Impact Calculation Service
```
Write a Python microservice `ProfitImpactService` that combines the outputs of the `RevenueImpactService` and `CostImpactService` to calculate the overall profit impact. This service should expose an API endpoint that takes the outputs from the other two services and returns the net profit increase. It should also consider tax implications and other financial factors.
```

### 3.4 Financial Model Orchestration
```
Develop a Python orchestration layer `FinancialModelOrchestrator` that coordinates calls to the `RevenueImpactService`, `CostImpactService`, and `ProfitImpactService`. This orchestrator should manage the flow of data between these services, handle error conditions, and aggregate their results into a single, comprehensive financial impact report. It should be deployable as a serverless function.
```

## 4. Prompt Engineering for Vercel (Backend Deployment)

### 4.1 Serverless Function Deployment for Financial Services
```
Provide `vercel.json` configurations and deployment instructions for deploying the `RevenueImpactService`, `CostImpactService`, `ProfitImpactService`, and `FinancialModelOrchestrator` as serverless functions on Vercel. Ensure proper routing, environment variable management for external data sources or APIs, and cold start optimization. Detail how these Python services can be exposed as API endpoints.
```

## 5. Prompt Engineering for PostgreSQL (Database Interactions)

### 5.1 Financial Data Persistence Procedures
```
Generate PostgreSQL stored procedures or functions for efficiently persisting the calculated revenue impact, cost impact, and profit impact into their respective tables (e.g., `financial_impact_results`). These procedures should handle inserts and updates, ensuring data integrity and performance. Consider how to link these results back to specific organisations and audit runs.
```

### 5.2 Optimized Financial Data Retrieval Queries
```
Write optimized SQL queries for retrieving the latest financial impact metrics for a given organisation. Focus on queries that leverage indexing and minimize joins to ensure fast retrieval for real-time dashboard updates and other module integrations. Include queries to fetch historical financial impact data for trend analysis.
```
