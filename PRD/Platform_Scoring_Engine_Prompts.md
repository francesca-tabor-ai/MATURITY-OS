# Prompt Engineering: Platform Infrastructure — Scoring Engine

## 1. Component Description
The Scoring Engine is a core platform infrastructure component responsible for calculating various maturity and alignment scores. This includes the Data Maturity Score, AI Maturity Score, Alignment Score, and Risk Score, serving as the backbone for many of the MATURITY OS™ modules.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel (as backend serverless functions)
*   **Media/Video:** Runway (Not directly applicable, but outputs might be visualized)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Data Maturity Score Calculation Service
```
Develop a Python microservice `DataMaturityScoringService` that encapsulates the logic for calculating the Data Maturity Score. This service should expose an API endpoint that accepts raw audit inputs (from Core Module 0.2) and returns the calculated Data Maturity Stage, Confidence Score, and Data Maturity Index. Ensure the service is scalable, stateless, and optimized for performance. Use a framework like FastAPI for the API.
```

### 3.2 AI Maturity Score Calculation Service
```
Create a Python microservice `AIMaturityScoringService` that encapsulates the logic for calculating the AI Maturity Score. This service should expose an API endpoint that accepts raw audit inputs (from Core Module 0.3) and returns the calculated AI Maturity Stage and AI Maturity Score. Similar to the Data Maturity service, focus on scalability, statelessness, and performance using FastAPI.
```

### 3.3 Alignment Score Calculation
```
Write a Python function `calculate_alignment_score` that takes an organisation's Data Maturity Index, AI Maturity Score, and its strategic objectives as inputs. The function should assess how well the data and AI capabilities are aligned with the organisation's overall strategy. Return an 'Alignment Score' (0-100) and a qualitative assessment (e.g., 'Well-aligned', 'Needs Improvement').
```

### 3.4 Risk Score Aggregation Service
```
Develop a Python microservice `RiskScoringService` that aggregates the individual risk scores (AI Misalignment, Infrastructure, Operational, Strategic from Module 1.3) and calculates an overall Risk Score (0-100) and Risk Level (LOW, MEDIUM, HIGH). This service should expose an API endpoint for consuming individual risk factors and returning the aggregated risk assessment. Implement configurable weighting for different risk types.
```

## 4. Prompt Engineering for Vercel (Backend Deployment)

### 4.1 Serverless Function Deployment for Scoring Services
```
Provide `vercel.json` configurations and deployment instructions for deploying the `DataMaturityScoringService`, `AIMaturityScoringService`, and `RiskScoringService` as serverless functions on Vercel. Ensure proper routing, environment variable management for database connections, and cold start optimization. Detail how these Python services can be exposed as API endpoints.
```

## 5. Prompt Engineering for PostgreSQL (Database Interactions)

### 5.1 Stored Procedures for Score Persistence
```
Generate PostgreSQL stored procedures or functions for efficiently persisting the calculated Data Maturity Scores, AI Maturity Scores, Alignment Scores, and Risk Scores into their respective tables (`data_maturity_results`, `ai_maturity_results`, `maturity_classifications`, `risk_assessments`). These procedures should handle inserts and updates, ensuring data integrity and performance.
```

### 5.2 Optimized Score Retrieval Queries
```
Write optimized SQL queries for retrieving the latest Data Maturity Score, AI Maturity Score, Alignment Score, and Risk Score for a given organisation. Focus on queries that leverage indexing and minimize joins to ensure fast retrieval for real-time dashboard updates and other module integrations.
```
