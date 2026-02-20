# Prompt Engineering: Module 4.1 — Company Valuation Adjustment Engine™

## 1. Module Description
This module calculates the potential impact of an organisation's data and AI maturity on its valuation. It takes current valuation, data maturity, AI maturity, and industry benchmarks to project potential valuation upside, providing critical insights for investors and M&A activities.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For valuation visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Valuation Adjustment Logic
```
Develop a Python function `calculate_valuation_adjustment` that takes as input an organisation's current valuation, data maturity index, AI maturity score, and relevant industry-specific valuation multiples or growth rates. The function should use a financial model (e.g., discounted cash flow, multiples-based valuation adjusted for maturity) to project a potential future valuation. Explain the model used and its assumptions. Return the potential valuation and the valuation upside.
```

### 3.2 Sensitivity Analysis for Valuation
```
Create a Python function `run_valuation_sensitivity_analysis` that takes the inputs for `calculate_valuation_adjustment` and a range of potential changes in data/AI maturity scores. The function should perform a sensitivity analysis to show how different levels of maturity improvement impact the projected valuation. The output should be a structured dataset suitable for plotting sensitivity curves.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Valuation Display Component
```
Develop a React component `ValuationAdjustmentDisplay` to present the current valuation, potential valuation, and valuation upside. Use visual elements like a large number display for key figures, and a waterfall chart or a bar chart to illustrate the upside. The component should also allow for interactive adjustment of maturity scores to see real-time valuation changes. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch data from a Next.js API endpoint.
```

### 4.2 Valuation API Endpoint
```
Generate a Next.js API route `/api/valuation-adjustment` that accepts an organisation ID, current valuation, and its data/AI maturity scores. This endpoint should call the Python `calculate_valuation_adjustment` function and return the valuation results as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Valuation Visualization)

### 5.1 Dynamic Valuation Upside Chart
```
Generate an animated chart visualization that clearly shows the current valuation and the potential valuation with improved data and AI maturity. The chart should dynamically grow from the current value to the potential value, highlighting the 'upside' in a compelling and professional manner. Provide variations in color schemes and animation styles, suitable for investor presentations.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Valuation Data Storage Schema
```
Design a PostgreSQL database schema to store the inputs and outputs of the Company Valuation Adjustment Engine for each organisation. Create a table `company_valuations` that includes `organisation_id`, `analysis_date`, `current_valuation`, `data_maturity_index`, `ai_maturity_score`, `potential_valuation`, and `valuation_upside`. Ensure proper foreign key relationships and data types.
```

### 6.2 Valuation Reporting Queries
```
Generate SQL queries to retrieve historical valuation adjustments for an organisation, compare different valuation scenarios, and aggregate valuation upside across a portfolio of companies. Include queries to identify companies with the highest potential valuation growth due to maturity improvements.
```
