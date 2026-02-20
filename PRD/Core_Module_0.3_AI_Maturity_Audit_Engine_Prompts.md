# Prompt Engineering: Core Module 0.3 — AI Maturity Audit Engine™

## 1. Module Description
This module assesses an organisation's AI maturity by auditing its automation maturity, AI usage (predictive models, recommendation systems, NLP, computer vision), and deployment maturity (experimental vs. production, enterprise-wide vs. isolated, decision automation level). It outputs an AI Maturity Stage (1–7) and an AI Maturity Score (0–100).

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (Potentially for AI-generated visual aids or simulations)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Automation Maturity Audit Logic
```
Develop a Python function that evaluates an organisation's automation maturity. Inputs will include data on manual vs. automated workflows and the presence of rule-based automation. The function should assign a score for 'Automation Maturity', considering the extent to which processes are automated and the sophistication of the automation. Provide examples of how different levels of automation impact the score.
```

### 3.2 AI Usage Audit Logic
```
Create a Python function to assess an organisation's AI usage. Inputs will include information on the adoption of predictive models, recommendation systems, NLP, and computer vision. The function should output a score for 'AI Usage', reflecting the breadth and depth of AI application within the organisation. Consider the business impact and integration of these AI technologies.
```

### 3.3 Deployment Maturity Audit Logic
```
Write a Python function to audit AI deployment maturity. Inputs will cover whether AI solutions are experimental vs. production, enterprise-wide vs. isolated, and the level of decision automation (human-in-the-loop vs. fully autonomous). The function should calculate a 'Deployment Maturity' score, emphasizing the scalability, reliability, and autonomy of deployed AI systems.
```

### 3.4 Overall AI Maturity Calculation
```
Create a Python class `AIMaturityEngine` that aggregates scores from Automation Maturity, AI Usage, and Deployment Maturity. This class should calculate the overall AI Maturity Stage (1-7) and an AI Maturity Score (0-100). Implement methods for weighting different categories and for handling missing or incomplete input data. The output should be a structured JSON object containing all calculated metrics.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 AI Audit Data Input Forms
```
Design and implement a series of React forms for collecting AI maturity audit inputs. Each form should correspond to a specific audit category (Automation, AI Usage, Deployment). Use Tailwind CSS for styling and ensure client-side validation. The forms should submit data to a Next.js API endpoint.
```

### 4.2 AI Maturity Dashboard Component
```
Develop a React component to display the calculated AI Maturity Stage and AI Maturity Score. Include visual elements like radar charts or bar graphs to represent the scores effectively. The component should fetch data from a Next.js API endpoint that calls the `AIMaturityEngine` backend. Ensure responsiveness and clear presentation of results.
```

## 5. Prompt Engineering for Runway (AI-generated Visual Aids)

### 5.1 AI Maturity Stage Visualisation
```
Generate a series of conceptual images or short animations representing different AI maturity stages (e.g., a simple gear for early stage, a complex neural network for advanced stage). These visuals should be abstract yet convey the essence of each stage, suitable for embedding in a web dashboard or report. Provide variations in style and color.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 AI Audit Data Storage Schema
```
Design a PostgreSQL database schema to store the raw audit inputs and the calculated AI maturity scores for each organisation. Create tables for `ai_audit_inputs` (to store granular responses for each category) and `ai_maturity_results` (to store the calculated stage and score). Ensure proper foreign key relationships to the `organisations` table. Define appropriate data types for numerical scores and text-based responses.
```

### 6.2 AI Maturity Reporting Queries
```
Generate SQL queries to retrieve historical AI maturity scores for an organisation, compare an organisation's scores across different audit periods, and fetch the detailed audit inputs that led to a specific maturity score. Include queries for calculating average AI maturity scores across all organisations and identifying organisations with the lowest/highest scores in specific categories.
```
