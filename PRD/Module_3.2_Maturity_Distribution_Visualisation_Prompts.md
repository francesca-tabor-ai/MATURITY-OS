# Prompt Engineering: Module 3.2 — Maturity Distribution Visualisation™

## 1. Module Description
This module visualizes the distribution of data and AI maturity across an industry or a portfolio of organisations. It helps users understand where their organisation stands relative to a broader group, providing context for their maturity scores.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For generating sophisticated distribution visualizations)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Maturity Data Aggregation for Distribution
```
Develop a Python function `aggregate_maturity_data` that takes a list of organisation IDs or an industry classification as input. This function should retrieve the latest data and AI maturity scores for all relevant organisations from the database. It should then aggregate this data into a format suitable for statistical analysis and visualization, such as a list of scores or a frequency distribution.
```

### 3.2 Statistical Analysis for Distribution
```
Create a Python function `analyze_maturity_distribution` that takes the aggregated maturity scores. This function should calculate key statistical measures such as mean, median, mode, standard deviation, and quartiles for both data and AI maturity. It should also identify outliers and potential clusters within the distribution. The output should be a JSON object containing these statistical insights.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Distribution Visualization Component
```
Develop a React component `MaturityDistributionChart` that displays the distribution of data and AI maturity scores. This component should be capable of rendering various chart types, such as histograms, box plots, or violin plots, to effectively illustrate the distribution. It should allow users to filter by industry or other organisational attributes. Use a charting library (e.g., Chart.js, Recharts) and Tailwind CSS for styling. The component should fetch data from a Next.js API endpoint.
```

### 4.2 Distribution Data API Endpoint
```
Generate a Next.js API route `/api/maturity-distribution` that accepts parameters for industry and maturity type. This endpoint should call the Python `aggregate_maturity_data` and `analyze_maturity_distribution` functions, and return the processed statistical data and raw scores as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Sophisticated Distribution Visualizations)

### 5.1 Interactive Histogram with Density Overlay
```
Generate an interactive histogram visualization for data and AI maturity scores, allowing users to adjust bin sizes. Overlay a kernel density estimate (KDE) curve on the histogram to show the continuous probability distribution. The visualization should be dynamic, allowing users to highlight specific ranges and see the count of organisations within those ranges. Provide a modern, clean aesthetic suitable for web embedding.
```

### 5.2 Animated Box Plot Comparison
```
Create an animated box plot visualization that compares the distribution of maturity scores across different industries or organisational segments. The animation should smoothly transition between different comparison groups, highlighting differences in median, quartiles, and outliers. Use distinct color palettes for each group and ensure the visualization is clear and easy to interpret.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Query for Aggregated Maturity Scores
```
Generate SQL queries to retrieve all data and AI maturity scores for organisations belonging to a specific industry or a defined portfolio. The queries should be optimized for performance when dealing with a large number of organisations. Include options to filter by date range to analyze historical distributions.
```

### 6.2 Query for Statistical Aggregates
```
Write SQL queries to calculate the mean, median, standard deviation, and quartiles of data and AI maturity scores for a given industry or group of organisations directly within PostgreSQL. This can offload some processing from the application layer and improve efficiency. Provide examples of how to use window functions or aggregate functions for these calculations.
```
