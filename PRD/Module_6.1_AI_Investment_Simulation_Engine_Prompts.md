# Prompt Engineering: Module 6.1 — AI Investment Simulation Engine™

## 1. Module Description
This module simulates the outcomes of various AI investment scenarios. It allows users to model the impact of different investment levels in data and AI maturity on key financial metrics like profit increase, providing a predictive tool for strategic planning.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For simulation visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Investment Impact Modeling
```
Develop a Python function `simulate_investment_impact` that takes as input a proposed investment amount (e.g., £10M), the target area (e.g., data maturity, AI maturity), and the organisation's current maturity scores. The function should model the expected improvement in maturity scores and, subsequently, the projected financial impact (e.g., expected profit increase, revenue growth) over a specified period. The model should account for diminishing returns and potential delays. Return a structured JSON object with simulation results.
```

### 3.2 Scenario Comparison Logic
```
Create a Python function `compare_investment_scenarios` that takes multiple simulation results (from `simulate_investment_impact`). This function should compare the outcomes of different investment scenarios, highlighting the most impactful and cost-effective options. It should provide metrics like ROI per investment unit, time to achieve target, and risk associated with each scenario. The output should be a ranked list of scenarios.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Simulation Input Form
```
Design and implement a React form `InvestmentSimulationForm` where users can define investment scenarios. This includes input fields for investment amount, target maturity area, and desired time horizon. The form should allow adding multiple scenarios for comparison. Use Tailwind CSS for styling and ensure client-side validation. Submit the data to a Next.js API endpoint.
```

### 4.2 Simulation Results Display
```
Develop a React component `SimulationResultsDisplay` to present the outcomes of the AI investment simulations. This component should display comparative charts (e.g., bar charts for profit increase, line graphs for maturity progression) for different scenarios. It should also highlight the best-performing scenario. Use a charting library (e.g., Chart.js) and Tailwind CSS for styling. The component should fetch data from a Next.js API endpoint.
```

## 5. Prompt Engineering for Runway (Simulation Visualization)

### 5.1 Interactive Investment Scenario Dashboard
```
Generate an interactive dashboard visualization that allows users to input investment parameters and instantly see the simulated financial outcomes. The dashboard should feature dynamic charts (e.g., stacked bar charts for profit increase breakdown, line graphs for maturity progression over time) that update in real-time. Include sliders or input fields for adjusting investment amounts and target areas. The visualization should be professional and suitable for strategic decision-making.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Simulation Data Storage Schema
```
Design a PostgreSQL database schema to store the inputs and results of AI investment simulations. Create a table `ai_investment_simulations` that includes `organisation_id`, `simulation_date`, `investment_amount`, `target_area`, `simulated_maturity_improvement`, `projected_profit_increase`, and a JSONB column for detailed scenario parameters and outcomes. Ensure proper foreign key relationships.
```

### 6.2 Simulation Reporting Queries
```
Generate SQL queries to retrieve historical investment simulations for an organisation, compare the outcomes of different simulation runs, and identify investment strategies that consistently yield the highest returns. Include queries to filter simulations by investment amount or target area.
```
