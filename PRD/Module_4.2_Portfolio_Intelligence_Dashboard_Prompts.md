# Prompt Engineering: Module 4.2 — Portfolio Intelligence Dashboard™

## 1. Module Description
This module provides a comprehensive dashboard for investors to view the maturity distribution, value creation opportunities, and risk exposure across their entire portfolio of companies. It aggregates insights from various MATURITY OS™ modules to offer a holistic view for investment decision-making.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For portfolio visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Portfolio Data Aggregation Service
```
Develop a Python service `PortfolioIntelligenceService` that aggregates data for a given investor's portfolio. This service should retrieve data maturity, AI maturity, financial impact, ROI, risk assessment, and valuation adjustment results for all companies within the portfolio. It should process and consolidate this information into a structured JSON object suitable for dashboard display. Implement efficient data retrieval and aggregation strategies.
```

### 3.2 Portfolio Performance Analysis
```
Create a Python function `analyze_portfolio_performance` within the `PortfolioIntelligenceService` that takes the aggregated portfolio data. This function should calculate key portfolio-level metrics such as average data/AI maturity, total potential revenue upside, aggregated risk score, and overall portfolio valuation upside. It should also identify top-performing and underperforming companies within the portfolio based on maturity and financial metrics.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Portfolio Dashboard UI Component
```
Develop a comprehensive React component `PortfolioIntelligenceDashboard` that serves as the main interface for investors. This component should integrate sub-components for displaying: portfolio maturity distribution (e.g., a histogram or box plot), value creation opportunities (e.g., aggregated revenue upside, profit expansion), and risk exposure (e.g., a portfolio-level risk heatmap). Use Tailwind CSS for a clean, professional, and responsive design. The component should fetch all its data from a single Next.js API endpoint.
```

### 4.2 Portfolio Dashboard API Endpoint
```
Generate a Next.js API route `/api/portfolio-intelligence` that accepts an investor ID or portfolio ID. This endpoint should call the `PortfolioIntelligenceService` to retrieve and prepare all necessary data for the dashboard. It should return a single JSON response containing all aggregated and formatted data. Implement robust error handling and data security measures, ensuring only authorized investors can access their portfolio data.
```

## 5. Prompt Engineering for Runway (Portfolio Visualization)

### 5.1 Interactive Portfolio Maturity Map
```
Generate an interactive visualization that maps all companies within an investor's portfolio based on their data and AI maturity scores. The visualization should allow for filtering by industry, sector, or investment stage. Each company should be represented by a clickable marker that reveals detailed maturity, financial, and risk information. Use a clean, professional design with customizable color schemes to highlight different segments of the portfolio.
```

### 5.2 Value Creation Opportunity Treemap
```
Create a dynamic treemap visualization that represents the total value creation opportunity across a portfolio. Each rectangle in the treemap should represent a company, with its size proportional to its potential revenue upside or valuation adjustment. The color of each rectangle could indicate its risk level. The treemap should be interactive, allowing users to drill down into individual company details.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Portfolio Data Access Queries
```
Generate SQL queries that efficiently retrieve the latest data for all companies within a specific investor's portfolio. This includes joining `data_maturity_results`, `ai_maturity_results`, `financial_impact_results`, `roi_investment_results`, `risk_assessments`, and `company_valuations` tables. Focus on optimized queries for aggregation and filtering by portfolio membership.
```

### 6.2 Portfolio Performance Reporting Queries
```
Write SQL queries to calculate portfolio-level metrics such as average data/AI maturity, total revenue upside, and aggregated risk scores. Include queries to identify the top N companies by valuation upside or the bottom N companies by maturity score within a portfolio. Consider how to efficiently query and aggregate data for large portfolios.
```
