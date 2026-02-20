# Prompt Engineering: Module 1.2 — ROI & Investment Calculator™

## 1. Module Description
This module calculates the required investment in data infrastructure and AI, along with the expected Return on Investment (ROI) and payback period. It leverages the financial impact estimations from Module 1.1 and considers the current maturity levels to project necessary investments and their financial returns.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For visualizing ROI and payback period)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Required Investment Calculation
```
Develop a Python function `calculate_required_investment` that takes as input the current data maturity stage, AI maturity stage, and desired target maturity stages. The function should estimate the necessary investment in data infrastructure and AI technologies to bridge this maturity gap. Consider factors like software licenses, hardware, talent acquisition, and training. Return separate monetary values for data infrastructure and AI investments.
```

### 3.2 Expected ROI Calculation
```
Create a Python function `calculate_expected_roi` that takes the estimated financial benefits (e.g., revenue upside, cost reduction from Module 1.1) and the calculated total investment (from `calculate_required_investment`). The function should compute the expected Return on Investment as a percentage or a multiplier (e.g., 6.5x). Clearly state the formula used for ROI calculation.
```

### 3.3 Payback Period Calculation
```
Write a Python function `calculate_payback_period` that takes the total investment and the annual financial benefits (e.g., annualized revenue upside + cost reduction). The function should determine the payback period in months or years, indicating how long it will take for the investment to be recouped. Handle cases where benefits might be insufficient to cover the investment.
```

### 3.4 ROI & Investment Aggregation
```
Create a Python class `ROIInvestmentCalculator` that integrates the investment, ROI, and payback period calculations. This class should take all necessary inputs (current/target maturity, financial benefits) and output a comprehensive JSON object detailing the required investments, expected ROI, and payback period. Include methods for scenario analysis, allowing users to adjust target maturity levels and see the impact on investment and returns.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Investment & ROI Input Forms
```
Design and implement a React form where users can input their current data/AI maturity stages and select desired target maturity stages. The form should also allow for manual adjustment of estimated financial benefits if needed. Use Tailwind CSS for styling and ensure client-side validation. Submit the data to a Next.js API endpoint that triggers the `ROIInvestmentCalculator` backend.
```

### 4.2 ROI & Payback Period Display Component
```
Develop a React component `ROIResultsDisplay` to present the calculated required investments, expected ROI, and payback period. Use visual elements like bar charts for investments, a large percentage/multiplier display for ROI, and a timeline for the payback period. The component should fetch data from a Next.js API endpoint and ensure responsiveness.
```

## 5. Prompt Engineering for Runway (ROI Visualization)

### 5.1 ROI & Payback Period Infographic
```
Generate an animated infographic that visually represents the concept of ROI and payback period. The infographic should clearly show an initial investment, the accumulation of benefits over time, and the point at which the investment is recouped. Use a clean, professional design with customizable colors and text. Provide variations for different ROI percentages and payback durations.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 ROI & Investment Data Storage Schema
```
Design a PostgreSQL database schema to store the inputs and outputs of the ROI & Investment Calculator for each organisation. Create a table `roi_investment_results` that includes `organisation_id`, `current_data_maturity`, `target_data_maturity`, `current_ai_maturity`, `target_ai_maturity`, `estimated_financial_benefits`, `required_data_investment`, `required_ai_investment`, `total_investment`, `expected_roi`, and `payback_period`. Ensure proper foreign key relationships and data types.
```

### 6.2 ROI & Investment Reporting Queries
```
Generate SQL queries to retrieve historical ROI and investment analyses for an organisation, compare different investment scenarios, and aggregate ROI data across multiple organisations. Include queries to identify investment strategies with the highest ROI or shortest payback periods.
```
