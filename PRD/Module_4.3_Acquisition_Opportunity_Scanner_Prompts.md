# Prompt Engineering: Module 4.3 — Acquisition Opportunity Scanner™

## 1. Module Description
This module identifies undervalued companies within a given market or industry based on their data and AI maturity, potential for improvement, and financial metrics. It leverages insights from other MATURITY OS™ modules to pinpoint attractive acquisition targets for investors.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For visualizing acquisition targets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Undervalued Company Identification Logic
```
Develop a Python function `identify_undervalued_companies` that takes as input a list of companies, their current valuations, data maturity scores, AI maturity scores, and industry benchmarks. The function should identify companies that are potentially undervalued based on a discrepancy between their current valuation and their intrinsic value derived from their data/AI maturity and potential for improvement. Return a list of identified companies with their undervaluation score.
```

### 3.2 Acquisition Target Scoring
```
Create a Python function `score_acquisition_targets` that takes a list of potentially undervalued companies and assigns an acquisition attractiveness score. This score should consider factors such as the company's growth potential, synergy with existing portfolio companies, risk profile, and the estimated cost of improving their data/AI maturity. The output should be a ranked list of acquisition targets.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Acquisition Target Display Component
```
Develop a React component `AcquisitionTargetDisplay` to present the identified undervalued companies and their acquisition attractiveness scores. The component should display a sortable table or a card-based layout, allowing users to filter by industry, maturity level, or undervaluation score. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch data from a Next.js API endpoint.
```

### 4.2 Acquisition Scanner API Endpoint
```
Generate a Next.js API route `/api/acquisition-scanner` that accepts parameters for industry, minimum/maximum valuation, and desired maturity levels. This endpoint should call the Python `identify_undervalued_companies` and `score_acquisition_targets` functions, and return the ranked list of acquisition targets as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Acquisition Target Visualization)

### 5.1 Acquisition Target Heatmap
```
Generate an interactive heatmap visualization that plots potential acquisition targets based on their undervaluation score (color intensity) and their data/AI maturity (axes). The heatmap should allow users to filter by industry or other criteria, and clicking on a company should reveal detailed information. The visualization should be clean, professional, and suitable for investor analysis.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Acquisition Data Storage Schema
```
Design a PostgreSQL database schema to store the results of the Acquisition Opportunity Scanner. Create a table `acquisition_opportunities` that includes `organisation_id`, `scan_date`, `undervaluation_score`, `acquisition_attractiveness_score`, and a JSONB column for detailed company data and rationale. Ensure proper foreign key relationships.
```

### 6.2 Acquisition Reporting Queries
```
Generate SQL queries to retrieve historical acquisition scans, track the performance of identified targets, and identify trends in undervalued companies within specific industries. Include queries to filter targets by their acquisition attractiveness score or undervaluation score.
```
