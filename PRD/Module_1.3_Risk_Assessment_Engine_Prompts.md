# Prompt Engineering: Module 1.3 — Risk Assessment Engine™

## 1. Module Description
This module calculates various risks associated with an organisation's data and AI initiatives, including AI misalignment risk, infrastructure risk, operational risk, and strategic risk. It outputs an overall risk score (0–100) and a qualitative risk level (e.g., HIGH, MEDIUM, LOW).

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For risk visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 AI Misalignment Risk Calculation
```
Develop a Python function `calculate_ai_misalignment_risk` that takes as input an organisation's AI maturity score, strategic goals, and current AI projects. The function should assess the potential for AI initiatives to deviate from or contradict business objectives. Return a numerical risk score (0-100) and a brief explanation of the contributing factors.
```

### 3.2 Infrastructure Risk Calculation
```
Create a Python function `calculate_infrastructure_risk` that evaluates an organisation's data and AI infrastructure. Inputs will include data storage types, cloud vs. on-premise setup, data integration complexity, and cybersecurity measures. The function should identify vulnerabilities and potential points of failure, returning a numerical risk score (0-100) for infrastructure.
```

### 3.3 Operational Risk Calculation
```
Write a Python function `calculate_operational_risk` that assesses risks related to the day-to-day operations of data and AI systems. Inputs will include data governance practices, data quality controls, team skill sets, and incident response procedures. The function should quantify the likelihood and impact of operational disruptions, returning a numerical risk score (0-100).
```

### 3.4 Strategic Risk Calculation
```
Implement a Python function `calculate_strategic_risk` that evaluates the broader strategic implications of an organisation's data and AI posture. Inputs will include industry benchmarks, competitive landscape, regulatory compliance, and the organisation's overall data/AI maturity. The function should identify risks that could impact long-term business viability, returning a numerical risk score (0-100).
```

### 3.5 Overall Risk Assessment Aggregation
```
Create a Python class `RiskAssessmentEngine` that aggregates scores from AI Misalignment, Infrastructure, Operational, and Strategic risks. This class should calculate an overall Risk Score (0-100) and assign a qualitative Risk Level (LOW, MEDIUM, HIGH) based on predefined thresholds. Implement methods for weighting different risk categories and for generating a summary of key risk areas. The output should be a structured JSON object.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Risk Input Forms
```
Design and implement a React form for collecting inputs relevant to AI misalignment, infrastructure, operational, and strategic risks. The form should include various input types (e.g., dropdowns, checkboxes, text areas) to gather detailed information. Use Tailwind CSS for styling and ensure client-side validation. Submit the data to a Next.js API endpoint that triggers the `RiskAssessmentEngine` backend.
```

### 4.2 Risk Assessment Display Component
```
Develop a React component `RiskAssessmentDisplay` to present the calculated overall Risk Score and Risk Level. Include visual elements like a risk meter, a heatmap, or a radar chart to clearly illustrate the different risk categories and their contributions to the overall score. The component should fetch data from a Next.js API endpoint and ensure responsiveness.
```

## 5. Prompt Engineering for Runway (Risk Visualization)

### 5.1 Risk Heatmap Generation
```
Generate an interactive risk heatmap visualization that displays various risk categories (AI Misalignment, Infrastructure, Operational, Strategic) on one axis and their impact/likelihood on the other. The heatmap should use a color gradient (e.g., green to red) to represent risk levels, allowing users to quickly identify high-risk areas. Provide options for filtering and drilling down into specific risks.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Risk Assessment Data Storage Schema
```
Design a PostgreSQL database schema to store the inputs and outputs of the Risk Assessment Engine for each organisation. Create a table `risk_assessments` that includes `organisation_id`, `ai_misalignment_risk_score`, `infrastructure_risk_score`, `operational_risk_score`, `strategic_risk_score`, `overall_risk_score`, and `risk_level`. Ensure proper foreign key relationships and data types.
```

### 6.2 Risk Reporting Queries
```
Generate SQL queries to retrieve historical risk assessments for an organisation, track changes in risk levels over time, and identify common risk patterns across a portfolio of organisations. Include queries to filter organisations by specific risk levels or categories.
```
