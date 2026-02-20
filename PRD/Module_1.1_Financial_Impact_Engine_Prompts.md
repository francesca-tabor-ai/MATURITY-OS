# Prompt Engineering: Module 1.1 — Financial Impact Engine™

## 1. Module Description
This module calculates the potential financial impact of improving data and AI maturity. It takes inputs such as revenue, profit margin, headcount, industry benchmarks, data maturity score, and AI maturity score to output revenue upside potential, profit margin expansion, and cost reduction potential.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For financial visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Revenue Upside Potential Calculation
```
Develop a Python function `calculate_revenue_upside` that takes current revenue, data maturity score, AI maturity score, and relevant industry benchmarks as inputs. The function should use a predefined model (e.g., linear regression or a rule-based system based on maturity levels) to estimate the potential increase in revenue. Provide a clear explanation of the underlying logic and assumptions. Ensure the function handles edge cases and returns a monetary value.
```

### 3.2 Profit Margin Expansion Calculation
```
Create a Python function `calculate_profit_margin_expansion` that takes current profit margin, data maturity score, AI maturity score, and industry benchmarks. This function should estimate the potential improvement in profit margin due to enhanced data and AI capabilities. Consider factors like operational efficiency gains and reduced waste. The output should be a percentage or a monetary value representing the expansion.
```

### 3.3 Cost Reduction Potential Calculation
```
Write a Python function `calculate_cost_reduction` that takes current operational costs, headcount, data maturity score, and AI maturity score. The function should identify areas where data and AI can lead to cost savings (e.g., automation, optimized resource allocation, predictive maintenance). Return a monetary value representing the potential cost reduction. Detail the assumptions made for the calculation.
```

### 3.4 Financial Impact Aggregation
```
Create a Python class `FinancialImpactEngine` that integrates the revenue upside, profit margin expansion, and cost reduction calculations. This class should take all necessary inputs (revenue, profit margin, headcount, industry benchmarks, data/AI maturity scores) and output a comprehensive JSON object detailing all financial impact metrics. Include methods for sensitivity analysis to show how changes in maturity scores affect financial outcomes.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Financial Input Forms
```
Design and implement a React form for collecting financial inputs (revenue, profit margin, headcount) and selecting relevant industry benchmarks. The form should be user-friendly, include input validation, and use Tailwind CSS for styling. Submit the data to a Next.js API endpoint that triggers the `FinancialImpactEngine` backend.
```

### 4.2 Financial Impact Dashboard Component
```
Develop a React component `FinancialImpactDashboard` to display the calculated revenue upside, profit margin expansion, and cost reduction potential. Use visual elements like bar charts, pie charts, or waterfall charts to clearly present the financial impacts. The component should fetch data from a Next.js API endpoint and ensure responsiveness across devices.
```

## 5. Prompt Engineering for Runway (Financial Visualization Assets)

### 5.1 Revenue Upside Visualization
```
Generate an animated infographic or a dynamic chart visualization that illustrates revenue growth potential. The visualization should clearly show current revenue and projected revenue with improved data/AI maturity, highlighting the 'upside' in a compelling, professional manner. Provide variations in color schemes and animation styles.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Financial Impact Data Storage Schema
```
Design a PostgreSQL database schema to store the inputs and outputs of the Financial Impact Engine for each organisation. Create a table `financial_impact_results` that includes `organisation_id`, `revenue_input`, `profit_margin_input`, `headcount_input`, `data_maturity_score`, `ai_maturity_score`, `revenue_upside`, `profit_margin_expansion`, and `cost_reduction`. Ensure proper foreign key relationships and data types.
```

### 6.2 Financial Impact Reporting Queries
```
Generate SQL queries to retrieve historical financial impact analyses for an organisation, compare financial projections over time, and aggregate financial impact data across multiple organisations. Include queries to identify organisations with the highest potential revenue upside or cost reduction.
```
