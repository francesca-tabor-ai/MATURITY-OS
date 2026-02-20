# Prompt Engineering: Module 2.1 — Transformation Roadmap Generator™

## 1. Module Description
This module generates a phased transformation roadmap for an organisation based on its current maturity, target maturity, identified capability gaps, and financial impact analysis. The roadmap includes recommended phases, estimated costs, and projected impacts (e.g., profit increase).

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For roadmap visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Roadmap Generation Logic
```
Develop a Python function `generate_roadmap` that takes as input an organisation's current data/AI maturity scores, target maturity scores, identified capability gaps (from Module 2.2), and potential financial impacts (from Module 1.1). The function should generate a phased transformation roadmap. Each phase should include a description of recommended actions (e.g., "Implement data warehouse", "Deploy predictive analytics"), estimated cost, and projected impact (e.g., "+£10M profit"). The output should be a structured JSON object representing the roadmap.
```

### 3.2 Action Item Prioritization
```
Create a Python function `prioritize_actions` that takes a list of potential transformation actions, their estimated costs, and their projected impacts. The function should prioritize these actions based on a configurable strategy (e.g., highest ROI first, lowest cost first, or strategic alignment). Return a prioritized list of actions that can be grouped into roadmap phases.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Roadmap Display Component
```
Develop a React component `RoadmapDisplay` to visualize the generated transformation roadmap. The component should present the roadmap as a timeline or a series of cards, clearly showing each phase, its actions, cost, and impact. Use Tailwind CSS for styling and ensure responsiveness. The component should fetch roadmap data from a Next.js API endpoint.
```

### 4.2 Roadmap Generation API Endpoint
```
Generate a Next.js API route `/api/generate-roadmap` that accepts necessary inputs (current/target maturity, capability gaps, financial impacts). This endpoint should call the Python `generate_roadmap` function and return the generated roadmap as a JSON object. Implement proper input validation and error handling.
```

## 5. Prompt Engineering for Runway (Roadmap Visualization)

### 5.1 Interactive Roadmap Timeline
```
Generate an interactive timeline visualization for a project roadmap. The timeline should allow for distinct phases, each with multiple milestones or action items. Each item should be clickable to reveal more details (cost, impact). The visualization should be modern, clean, and suitable for embedding in a web application. Provide options for customizing colors and fonts.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Roadmap Storage Schema
```
Design a PostgreSQL database schema to store the generated transformation roadmaps for each organisation. Create a table `transformation_roadmaps` that includes `organisation_id`, `generation_date`, and a JSONB column to store the detailed phased roadmap structure (actions, costs, impacts). Ensure proper foreign key relationships.
```

### 6.2 Roadmap Reporting Queries
```
Generate SQL queries to retrieve an organisation's historical roadmaps, compare different roadmap scenarios, and track the progress of implemented roadmap phases. Include queries to identify common roadmap actions across organisations or to find roadmaps with the highest projected financial impact.
```
