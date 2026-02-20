# Prompt Engineering: Module 2.3 — Executive Dashboard™

## 1. Module Description
This module provides a unified executive dashboard that displays key insights from across the MATURITY OS™. It integrates and visualizes an organisation's maturity position (Data and AI), financial upside, risk exposure, and transformation roadmap, offering a high-level overview for strategic decision-making.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For overall dashboard design and interactive elements)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Data Aggregation Service
```
Develop a Python service `ExecutiveDashboardService` that aggregates data from various modules: Data Maturity Audit Engine (0.2), AI Maturity Audit Engine (0.3), Maturity Classification Engine (0.4), Financial Impact Engine (1.1), ROI & Investment Calculator (1.2), Risk Assessment Engine (1.3), and Transformation Roadmap Generator (2.1). This service should provide a single, coherent JSON object containing all necessary data points for the executive dashboard. Implement efficient data retrieval and caching mechanisms.
```

### 3.2 Dashboard Data Preparation
```
Create a Python function `prepare_dashboard_data` within the `ExecutiveDashboardService` that processes the raw aggregated data into a format suitable for frontend visualization. This includes formatting numbers, calculating derived metrics (e.g., year-over-year growth), and structuring the data for different chart types. Ensure the output is optimized for quick rendering on the frontend.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Executive Dashboard UI Component
```
Develop a comprehensive React component `ExecutiveDashboard` that serves as the main interface for executives. This component should integrate sub-components for displaying: maturity position (e.g., a quadrant chart), financial upside (e.g., bar charts), risk exposure (e.g., a risk meter or heatmap), and the transformation roadmap (e.g., a timeline view). Use Tailwind CSS for a clean, modern, and responsive design. The component should fetch all its data from a single Next.js API endpoint.
```

### 4.2 Dashboard API Endpoint
```
Generate a Next.js API route `/api/executive-dashboard` that acts as the backend for the `ExecutiveDashboard` component. This endpoint should call the `ExecutiveDashboardService` to retrieve and prepare all necessary data. It should return a single JSON response containing all aggregated and formatted data for the dashboard. Implement robust error handling and data security measures.
```

## 5. Prompt Engineering for Runway (Interactive Dashboard Elements)

### 5.1 Dynamic Executive Dashboard Layout
```
Generate a conceptual design for an interactive executive dashboard layout. The design should feature distinct sections for maturity, financial impact, risk, and roadmap, with smooth transitions and data-driven animations. Focus on a clean, professional aesthetic with customizable color palettes. Include placeholders for various chart types (e.g., bar charts, line graphs, gauges, timelines) and key performance indicators.
```

### 5.2 Animated KPI Cards
```
Create animated KPI cards for displaying key metrics like "Data Maturity Index", "AI Maturity Score", "Revenue Upside", and "Overall Risk Score". Each card should feature a prominent number, a small trend indicator (e.g., up/down arrow), and a subtle background animation. The animations should be subtle and professional, enhancing data comprehension without being distracting.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Dashboard Data Access Queries
```
Generate SQL queries that efficiently retrieve the latest data for the executive dashboard from the `data_maturity_results`, `ai_maturity_results`, `maturity_classifications`, `financial_impact_results`, `roi_investment_results`, `risk_assessments`, and `transformation_roadmaps` tables. Focus on optimized queries that join necessary tables and aggregate data for quick dashboard loading. Include queries to fetch data for a specific organisation.
```

### 6.2 Historical Dashboard Data for Trends
```
Write SQL queries to retrieve historical snapshots of dashboard data, allowing for trend analysis over time. This would involve querying historical records from the various results tables to show how maturity, financial impact, and risk have evolved for an organisation. Consider how to efficiently store and retrieve time-series data for dashboard trends.
```
