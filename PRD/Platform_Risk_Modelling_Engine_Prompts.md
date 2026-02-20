# Prompt Engineering: Platform Infrastructure — Risk Modelling Engine

## 1. Component Description
The Risk Modelling Engine is a core platform infrastructure component responsible for quantifying various risks. It calculates the probability of failure and expected financial loss associated with different data and AI initiatives, feeding into modules like the Risk Assessment Engine and Strategic Decision Simulator.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel (as backend serverless functions)
*   **Media/Video:** Runway (Not directly applicable, but outputs might be visualized)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Probability of Failure Calculation Service
```
Develop a Python microservice `ProbabilityOfFailureService` that encapsulates the logic for calculating the probability of failure for various data and AI initiatives. This service should expose an API endpoint that accepts inputs such as project complexity, team experience, infrastructure stability, and historical failure rates. It should return a probability score (0-1) and a confidence interval. Ensure the service is scalable and uses appropriate statistical models (e.g., Bayesian networks, Monte Carlo simulation).
```

### 3.2 Expected Financial Loss Calculation Service
```
Create a Python microservice `ExpectedFinancialLossService` that encapsulates the logic for calculating the expected financial loss associated with identified risks. This service should expose an API endpoint that accepts inputs such as the probability of failure (from `ProbabilityOfFailureService`), potential impact (e.g., direct costs, indirect costs, reputational damage), and mitigation costs. It should return a monetary value representing the expected financial loss. Focus on robust financial modeling and sensitivity analysis.
```

### 3.3 Risk Model Orchestration
```
Develop a Python orchestration layer `RiskModelOrchestrator` that coordinates calls to the `ProbabilityOfFailureService` and `ExpectedFinancialLossService`. This orchestrator should manage the flow of data between these services, handle error conditions, and aggregate their results into a single, comprehensive risk assessment report. It should be deployable as a serverless function.
```

## 4. Prompt Engineering for Vercel (Backend Deployment)

### 4.1 Serverless Function Deployment for Risk Services
```
Provide `vercel.json` configurations and deployment instructions for deploying the `ProbabilityOfFailureService`, `ExpectedFinancialLossService`, and `RiskModelOrchestrator` as serverless functions on Vercel. Ensure proper routing, environment variable management for external data sources or APIs, and cold start optimization. Detail how these Python services can be exposed as API endpoints.
```

## 5. Prompt Engineering for PostgreSQL (Database Interactions)

### 5.1 Risk Data Persistence Procedures
```
Generate PostgreSQL stored procedures or functions for efficiently persisting the calculated probability of failure and expected financial loss into their respective tables (e.g., `risk_assessments`). These procedures should handle inserts and updates, ensuring data integrity and performance. Consider how to link these results back to specific initiatives and audit runs.
```

### 5.2 Optimized Risk Data Retrieval Queries
```
Write optimized SQL queries for retrieving the latest risk metrics for a given initiative or organisation. Focus on queries that leverage indexing and minimize joins to ensure fast retrieval for real-time dashboard updates and other module integrations. Include queries to fetch historical risk data for trend analysis.
```
