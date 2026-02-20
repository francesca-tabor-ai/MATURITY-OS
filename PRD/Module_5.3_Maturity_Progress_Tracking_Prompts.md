# Prompt Engineering: Module 5.3 — Maturity Progress Tracking™

## 1. Module Description
This module visualizes and tracks an organisation's maturity improvement over time. It leverages historical data from the Live Maturity Monitoring module to show progress against set goals, identify trends, and provide insights into the effectiveness of transformation initiatives.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For progress visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Progress Calculation Logic
```
Develop a Python function `calculate_maturity_progress` that takes an organisation's historical data and AI maturity scores (from `maturity_snapshots` table) and a defined time period. The function should calculate the percentage improvement in both data and AI maturity over that period. It should also identify key milestones or significant changes in scores. The output should be a structured JSON object detailing the progress.
```

### 3.2 Goal Tracking and Variance Analysis
```
Create a Python function `track_maturity_goals` that takes an organisation's current maturity scores, historical scores, and predefined target maturity scores. The function should calculate the variance from the target goals and project the estimated time to reach those goals based on current progress rates. It should also flag if the organisation is ahead or behind schedule.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Progress Tracking Display Component
```
Develop a React component `MaturityProgressTracker` that visualizes an organisation's maturity improvement over time. This component should feature line graphs showing historical trends, progress bars indicating proximity to goals, and clear indicators of percentage improvement. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch data from a Next.js API endpoint.
```

### 4.2 Progress Tracking API Endpoint
```
Generate a Next.js API route `/api/maturity-progress` that accepts an organisation ID and a time range. This endpoint should call the Python `calculate_maturity_progress` and `track_maturity_goals` functions, and return the progress tracking data as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Progress Visualization)

### 5.1 Animated Progress Bar with Milestones
```
Generate an animated progress bar visualization that shows an organisation's journey from its initial maturity score to its current score, with an indication of the target score. The progress bar should dynamically fill, and key milestones or significant improvements should be highlighted along the path. Use a clean, professional design with customizable colors and text, suitable for web embedding.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Progress Data Access Queries
```
Generate SQL queries to retrieve historical data and AI maturity scores for an organisation over a specified time period. Focus on optimized queries for time-series data to calculate progress and trends efficiently. Include queries to fetch predefined maturity goals for an organisation.
```

### 6.2 Goal Tracking Queries
```
Write SQL queries to store and retrieve maturity goals for each organisation. This would involve a table `maturity_goals` with `organisation_id`, `goal_type` (e.g., 'Data Maturity', 'AI Maturity'), `target_score`, and `target_date`. Generate queries to compare current scores against these targets and calculate variances.
```
