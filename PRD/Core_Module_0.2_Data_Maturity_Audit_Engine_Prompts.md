# Prompt Engineering: Core Module 0.2 — Data Maturity Audit Engine™

## 1. Module Description
This module is the core of the MATURITY OS™, responsible for auditing and assessing an organisation's data maturity across various categories: Data Collection, Data Storage, Data Integration, Data Governance, and Data Accessibility. It processes collected data to calculate a Data Maturity Stage (1–6), a Confidence Score, and a Data Maturity Index (0–100).

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (Potentially for data visualization components)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Data Collection Audit Logic
```
Develop a Python function that takes as input a JSON object representing an organisation's data collection practices (e.g., identified data sources, structured vs unstructured data, data completeness score). The function should analyze these inputs and return a preliminary score for the 'Data Collection' category, along with a confidence level. Consider using a rule-based system or a simple machine learning model for scoring. Focus on clean, modular code.
```

### 3.2 Data Storage Audit Logic
```
Create a Python function to assess an organisation's data storage maturity. Inputs will include details on storage types (spreadsheets, database, warehouse, lakehouse), cloud vs on-premise, and real-time vs batch processing. The function should output a score for 'Data Storage' maturity, considering best practices for scalability, security, and accessibility. Provide examples of how different storage configurations impact the score.
```

### 3.3 Data Integration Audit Logic
```
Write a Python function to evaluate data integration maturity based on the number of integrated systems, API availability, and data pipeline maturity. The function should assign a score for 'Data Integration', emphasizing the efficiency and robustness of data flow within the organisation. Include considerations for ETL/ELT processes and data quality checks during integration.
```

### 3.4 Data Governance Audit Logic
```
Implement a Python function to audit data governance practices. Inputs will cover data ownership definition, data quality controls, and metadata management. The function should calculate a 'Data Governance' score, highlighting the effectiveness of policies and procedures in maintaining data integrity and compliance. Provide examples of how strong governance practices contribute to a higher score.
```

### 3.5 Data Accessibility Audit Logic
```
Develop a Python function to assess data accessibility maturity. Inputs will include the availability of self-service analytics, real-time data access, and cross-functional access. The function should output a 'Data Accessibility' score, focusing on how easily and efficiently users can access and utilize data for decision-making. Consider different user roles and their access needs.
```

### 3.6 Overall Data Maturity Calculation
```
Create a Python class `DataMaturityEngine` that aggregates scores from Data Collection, Storage, Integration, Governance, and Accessibility. This class should calculate the overall Data Maturity Stage (1-6), a Confidence Score, and a Data Maturity Index (0-100). Implement methods for weighting different categories and for handling missing or incomplete input data. The output should be a structured JSON object containing all calculated metrics.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Audit Data Input Forms
```
Design and implement a series of React forms for collecting data maturity audit inputs. Each form should correspond to a specific audit category (Collection, Storage, Integration, Governance, Accessibility). Use Tailwind CSS for styling and ensure client-side validation. The forms should submit data to a Next.js API endpoint.
```

### 4.2 Data Maturity Dashboard Component
```
Develop a React component to display the calculated Data Maturity Stage, Confidence Score, and Data Maturity Index. Include visual elements like progress bars, gauges, or charts to represent the scores effectively. The component should fetch data from a Next.js API endpoint that calls the `DataMaturityEngine` backend. Ensure responsiveness and clear presentation of results.
```

## 5. Prompt Engineering for Runway (Data Visualization Assets)

### 5.1 Data Maturity Index Visualization
```
Generate a series of animated data visualizations (e.g., a radial bar chart or a speedometer-like gauge) that dynamically represent a data maturity index from 0 to 100. The visualization should be clean, modern, and easily embeddable into a web application. Provide variations for different maturity stages (e.g., distinct color palettes for early, developing, and mature stages).
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Audit Data Storage Schema
```
Design a PostgreSQL database schema to store the raw audit inputs and the calculated data maturity scores for each organisation. Create tables for `data_audit_inputs` (to store granular responses for each category) and `data_maturity_results` (to store the calculated stage, confidence, and index). Ensure proper foreign key relationships to the `organisations` table. Define appropriate data types for numerical scores and text-based responses.
```

### 6.2 Data Maturity Reporting Queries
```
Generate SQL queries to retrieve historical data maturity scores for an organisation, compare an organisation's scores across different audit periods, and fetch the detailed audit inputs that led to a specific maturity score. Include queries for calculating average maturity scores across all organisations and identifying organisations with the lowest/highest scores in specific categories.
```
