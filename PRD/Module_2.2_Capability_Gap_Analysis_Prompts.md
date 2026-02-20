# Prompt Engineering: Module 2.2 — Capability Gap Analysis™

## 1. Module Description
This module identifies missing capabilities within an organisation based on its current data and AI maturity assessments and desired target states. It pinpoints specific areas where the organisation needs to develop or acquire new skills, technologies, or processes to achieve its transformation goals.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For visualizing capability gaps)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Capability Gap Identification Logic
```
Develop a Python function `identify_capability_gaps` that takes as input an organisation's current data maturity assessment (from Module 0.2), AI maturity assessment (from Module 0.3), and a predefined set of ideal capabilities for target maturity stages. The function should compare the current state against the ideal state and identify specific missing capabilities (e.g., "Data pipeline automation", "Data governance framework", "Model deployment infrastructure"). The output should be a list of identified gaps.
```

### 3.2 Gap Prioritization and Grouping
```
Create a Python function `prioritize_gaps` that takes the identified capability gaps and assigns a priority level (e.g., High, Medium, Low) based on their impact on achieving target maturity and their estimated effort to address. The function should also group related gaps into broader themes or initiatives. This will help in structuring the transformation roadmap.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Capability Gap Display Component
```
Develop a React component `CapabilityGapDisplay` to present the identified missing capabilities. The component should display the gaps as a list or a tag cloud, with clear indications of their priority and grouping. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch capability gap data from a Next.js API endpoint.
```

### 4.2 API Endpoint for Gap Analysis
```
Generate a Next.js API route `/api/capability-gaps` that accepts the current data and AI maturity assessments as input. This endpoint should call the Python `identify_capability_gaps` and `prioritize_gaps` functions and return the identified and prioritized capability gaps as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Capability Gap Visualization)

### 5.1 Capability Gap Radar Chart
```
Generate a radar chart visualization that compares an organisation's current capabilities against ideal capabilities across different dimensions (e.g., data collection, data governance, AI usage, deployment). The chart should clearly highlight the areas where gaps exist, using distinct colors for current and ideal states. The visualization should be interactive and suitable for web embedding.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Capability Gap Storage Schema
```
Design a PostgreSQL database schema to store the identified capability gaps for each organisation. Create a table `capability_gaps` that includes `organisation_id`, `analysis_date`, `gap_description`, `priority_level`, and `grouped_theme`. Ensure proper foreign key relationships to the `organisations` table and appropriate data types.
```

### 6.2 Capability Gap Reporting Queries
```
Generate SQL queries to retrieve historical capability gap analyses for an organisation, track the resolution of identified gaps over time, and identify common capability gaps across a group of organisations. Include queries to filter gaps by priority level or theme.
```
