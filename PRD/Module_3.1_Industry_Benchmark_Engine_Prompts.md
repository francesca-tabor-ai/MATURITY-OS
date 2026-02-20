# Prompt Engineering: Module 3.1 — Industry Benchmark Engine™

## 1. Module Description
This module compares an organisation's data and AI maturity against industry peers and benchmarks. It takes the organisation's maturity scores and industry classification to provide comparative insights, highlighting areas where the organisation is above or below average.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For comparative visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Industry Benchmark Retrieval
```
Develop a Python function `get_industry_benchmarks` that takes an industry classification (e.g., 'Finance', 'Healthcare') and a maturity type (e.g., 'Data', 'AI') as input. This function should retrieve relevant average maturity scores and distribution data for that industry from a predefined dataset or an external API. Handle cases where benchmarks are not available for a specific industry.
```

### 3.2 Comparative Analysis Logic
```
Create a Python function `compare_to_benchmarks` that takes an organisation's data maturity score, AI maturity score, and the retrieved industry benchmarks. The function should compare the organisation's scores against the industry averages and determine if it is 'Above average', 'At average', or 'Below average' for each maturity type. It should also provide a percentage difference from the average.
```

### 3.3 Benchmark Reporting
```
Write a Python class `IndustryBenchmarkEngine` that integrates the benchmark retrieval and comparative analysis logic. This class should take an organisation's ID and industry as input, fetch its latest maturity scores, retrieve relevant benchmarks, and generate a comprehensive report (JSON object) detailing the comparison. Include insights on strengths and weaknesses relative to the industry.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Benchmark Display Component
```
Develop a React component `IndustryBenchmarkDisplay` to present the comparative analysis results. The component should clearly show the organisation's maturity scores alongside industry averages, using visual elements like bar charts or gauges. Indicate whether the organisation is above, at, or below average. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch data from a Next.js API endpoint.
```

### 4.2 Benchmark API Endpoint
```
Generate a Next.js API route `/api/industry-benchmarks` that accepts an organisation ID and optionally an industry classification. This endpoint should call the `IndustryBenchmarkEngine` backend and return the comparative benchmark results as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Comparative Visualization)

### 5.1 Comparative Bar Chart Animation
```
Generate an animated bar chart visualization that compares an organisation's data and AI maturity scores against industry averages. The animation should smoothly transition between the organisation's score and the benchmark, highlighting the difference. Use distinct colors for the organisation and the industry average. The visualization should be suitable for web embedding.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Benchmark Data Storage Schema
```
Design a PostgreSQL database schema to store industry benchmark data. Create a table `industry_benchmarks` that includes `industry_name`, `maturity_type` (e.g., 'Data', 'AI'), `average_score`, and `score_distribution` (e.g., JSONB for quartiles or standard deviation). This table will be populated with external benchmark data. Also, store the results of each organisation's benchmark comparison in a `organisation_benchmarks` table.
```

### 6.2 Benchmark Reporting Queries
```
Generate SQL queries to retrieve industry benchmarks for a given industry and maturity type. Also, generate queries to fetch an organisation's historical benchmark comparisons, identify organisations that consistently outperform their industry, or find industries with the highest average maturity.
```
