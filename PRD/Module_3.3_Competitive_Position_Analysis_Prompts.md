# Prompt Engineering: Module 3.3 — Competitive Position Analysis™

## 1. Module Description
This module analyzes an organisation's competitive standing based on its data and AI maturity relative to its competitors. It outputs a competitive risk level and a competitive advantage score, providing insights into market positioning.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For competitive landscape visualizations)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Competitive Risk Level Calculation
```
Develop a Python function `calculate_competitive_risk` that takes an organisation's data and AI maturity scores, along with the average maturity scores of its key competitors. The function should assess the competitive risk level (e.g., Low, Medium, High) based on how far behind or ahead the organisation is compared to its rivals. Consider factors like market share, innovation pace, and industry disruption. Return a qualitative risk level and a numerical score.
```

### 3.2 Competitive Advantage Score Calculation
```
Create a Python function `calculate_competitive_advantage` that takes an organisation's maturity scores and compares them against leading competitors. The function should quantify the competitive advantage score (0-100) by identifying unique strengths in data and AI capabilities that differentiate the organisation in the market. Consider aspects like proprietary data sets, advanced AI models, and efficient deployment strategies.
```

### 3.3 Competitive Analysis Aggregation
```
Write a Python class `CompetitivePositionEngine` that integrates the competitive risk and advantage calculations. This class should take an organisation's ID and a list of competitor IDs (or industry) as input, fetch their respective maturity scores, and generate a comprehensive report (JSON object) detailing the competitive position. Include insights on areas of strength and weakness relative to competitors.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Competitive Position Display Component
```
Develop a React component `CompetitivePositionDisplay` to visualize the competitive risk level and competitive advantage score. Use visual elements like a speedometer for advantage score, and a color-coded indicator for risk level. The component should also display a comparison table or chart showing the organisation's maturity against key competitors. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch data from a Next.js API endpoint.
```

### 4.2 Competitive Analysis API Endpoint
```
Generate a Next.js API route `/api/competitive-position` that accepts an organisation ID and optionally a list of competitor IDs or an industry. This endpoint should call the `CompetitivePositionEngine` backend and return the competitive analysis results as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Competitive Landscape Visualizations)

### 5.1 Competitive Matrix Visualization
```
Generate an interactive 2D matrix visualization where organisations are plotted based on their data maturity (X-axis) and AI maturity (Y-axis). The visualization should highlight the user's organisation and its key competitors, using different markers or colors. Allow for dynamic labeling and tooltips to display additional information about each company. The visualization should be suitable for web embedding and provide insights into market clusters and competitive gaps.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Competitive Data Storage Schema
```
Design a PostgreSQL database schema to store competitive analysis results. Create a table `competitive_positions` that includes `organisation_id`, `analysis_date`, `competitor_id`, `competitive_risk_level`, `competitive_risk_score`, `competitive_advantage_score`, and a JSONB column for detailed comparison data. Ensure proper foreign key relationships to the `organisations` table.
```

### 6.2 Competitive Reporting Queries
```
Generate SQL queries to retrieve an organisation's historical competitive position analyses, track changes in its competitive standing over time, and identify market leaders or laggards based on maturity scores. Include queries to compare an organisation against a specific set of competitors.
```
