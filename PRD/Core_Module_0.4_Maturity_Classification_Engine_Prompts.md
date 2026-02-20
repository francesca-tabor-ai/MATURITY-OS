# Prompt Engineering: Core Module 0.4 — Maturity Classification Engine™

## 1. Module Description
This module takes the Data Maturity Index and AI Maturity Score as inputs and maps the organisation to a specific matrix position, providing a human-readable classification (e.g., "Intelligent Operator"). It also outputs matrix coordinates, risk classification, and opportunity classification based on the combined maturity scores.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (Potentially for visualising the maturity matrix)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Maturity Classification Logic
```
Develop a Python function `classify_maturity` that takes two integer inputs: `data_maturity_index` (0-100) and `ai_maturity_score` (0-100). Based on these scores, the function should return a string classification (e.g., "Data-Driven Innovator", "AI-First Transformer", "Intelligent Operator", "Emerging Explorer"). Define clear thresholds and logic for each classification. Additionally, output matrix coordinates (e.g., [x, y] where x is data maturity and y is AI maturity), a risk classification (Low, Medium, High), and an opportunity classification (e.g., "Data Infrastructure Upgrade", "AI Adoption Acceleration").
```

### 3.2 Classification Rule Engine
```
Design a flexible rule engine in Python that allows for easy modification and expansion of maturity classifications. The engine should load classification rules from a configuration file (e.g., JSON or YAML) and apply them to the input data maturity index and AI maturity score. This allows for dynamic updates to the classification logic without code changes. Provide an example configuration file structure.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Classification Display Component
```
Create a React component `MaturityClassificationDisplay` that takes the classification string, matrix coordinates, risk classification, and opportunity classification as props. This component should visually present these outputs in a clear and engaging manner. Use Tailwind CSS for styling. The component should fetch the classification results from a Next.js API endpoint that calls the backend classification logic.
```

### 4.2 API Endpoint for Classification
```
Generate a Next.js API route `/api/classify-maturity` that accepts `data_maturity_index` and `ai_maturity_score` as query parameters or in the request body. This endpoint should call the Python `classify_maturity` function (or the rule engine) and return the classification results as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Maturity Matrix Visualization)

### 5.1 Interactive Maturity Matrix
```
Generate an interactive 2D matrix visualization where the X-axis represents Data Maturity Index (0-100) and the Y-axis represents AI Maturity Score (0-100). The matrix should be divided into distinct quadrants or regions, each corresponding to a specific maturity classification (e.g., "Intelligent Operator"). Allow for a dynamic marker to be placed on the matrix based on input scores, visually indicating the organisation's position. The visualization should be suitable for web embedding.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Classification Result Storage Schema
```
Design a PostgreSQL database schema to store the results of the maturity classification for each organisation. Create a table `maturity_classifications` that includes `organisation_id`, `data_maturity_index`, `ai_maturity_score`, `classification_string`, `matrix_x_coordinate`, `matrix_y_coordinate`, `risk_classification`, and `opportunity_classification`. Ensure proper foreign key relationships to the `organisations` table and appropriate data types.
```

### 6.2 Classification History and Trend Queries
```
Generate SQL queries to retrieve an organisation's historical maturity classifications, track changes in their matrix position over time, and identify common classifications across a group of organisations. Include queries to find organisations with specific risk or opportunity classifications.
```
