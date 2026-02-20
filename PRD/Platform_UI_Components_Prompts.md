# Prompt Engineering: Platform Infrastructure — UI Components

## 1. Component Description
The UI Components are the foundational building blocks for the MATURITY OS™ user interface. This includes the Executive Dashboard, Maturity Matrix Visualization, Risk Heatmap, Financial Impact Charts, Transformation Roadmap Timeline, and ROI Calculator, ensuring a consistent, intuitive, and responsive user experience across the platform.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel (Frontend)
*   **Media/Video:** Runway (For design assets, interactive elements, and animations)
*   **Database:** PostgreSQL (Indirectly, via API layer for data retrieval)

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Executive Dashboard Layout and Integration
```
Generate a React component `ExecutiveDashboardLayout` that serves as the main container for the executive dashboard. This component should integrate sub-components for displaying maturity position, financial upside, risk exposure, and transformation roadmap. Use a responsive grid system (e.g., CSS Grid or Flexbox with Tailwind CSS) to arrange these elements. Ensure data fetching from a Next.js API endpoint and proper state management for interactive elements.
```

### 3.2 Maturity Matrix Visualization Component
```
Create a React component `MaturityMatrixChart` that visualizes the organisation's position on a 2D matrix (Data Maturity vs. AI Maturity). The component should render distinct regions for different maturity classifications and allow for a dynamic marker to indicate the organisation's current position. Use a charting library like Chart.js or D3.js for rendering, and Tailwind CSS for styling. Ensure interactivity (e.g., tooltips on hover).
```

### 3.3 Risk Heatmap Component
```
Develop a React component `RiskHeatmap` that displays a heatmap of various risk categories (e.g., AI Misalignment, Infrastructure, Operational, Strategic). The heatmap should use a color gradient to represent risk levels and allow for filtering and drill-down capabilities. Integrate with a charting library and ensure the component is responsive and accessible.
```

### 3.4 Financial Impact Charts Component
```
Write a React component `FinancialImpactCharts` that includes multiple chart types (e.g., bar charts, waterfall charts) to visualize revenue upside, profit margin expansion, and cost reduction potential. The component should be capable of displaying historical data and projections. Use a modern charting library and ensure the charts are interactive and clearly labeled.
```

### 3.5 Transformation Roadmap Timeline Component
```
Implement a React component `RoadmapTimeline` that visualizes the phased transformation roadmap. This component should display each phase with its actions, estimated costs, and projected impacts in a clear, chronological timeline format. Allow for expansion of phases to show detailed action items. Use Tailwind CSS for layout and styling.
```

### 3.6 ROI Calculator Component
```
Create a React component `ROICalculator` that provides an interactive interface for users to input investment parameters and instantly see the calculated ROI and payback period. The component should include input fields, sliders, and dynamic output displays. Ensure client-side validation and clear presentation of results.
```

## 4. Prompt Engineering for Vercel (Frontend Deployment)

### 4.1 Frontend Application Structure
```
Generate a Next.js application structure that effectively organizes all UI components, pages, and API routes. Implement global state management (e.g., Zustand, React Context) for sharing data across components. Configure routing for different dashboard views and user flows. Ensure the application is optimized for performance, SEO, and accessibility.
```

### 4.2 Responsive Design and Theming
```
Develop a comprehensive Tailwind CSS configuration that supports responsive design across various screen sizes (mobile, tablet, desktop) and implements a consistent brand theme for MATURITY OS™. Include dark mode support and define a clear color palette, typography, and spacing system. Provide examples of how to apply these styles to common UI elements.
```

## 5. Prompt Engineering for Runway (Design Assets and Animations)

### 5.1 Dashboard Micro-interactions and Animations
```
Generate a series of subtle, professional micro-interactions and animations for the MATURITY OS™ dashboard. This includes hover effects for cards, smooth transitions between chart states, loading animations for data fetching, and feedback animations for user actions (e.g., form submission success). Focus on enhancing user experience without being distracting.
```

### 5.2 Iconography and Illustrations
```
Create a cohesive set of SVG icons and abstract illustrations for key concepts within MATURITY OS™, such as 'Data Maturity', 'AI Maturity', 'Risk', 'Financial Impact', and 'Transformation'. The style should be modern, clean, and align with the overall brand aesthetic. Provide variations for different states (e.g., active, inactive).
```

## 6. Prompt Engineering for PostgreSQL (Data Access for UI)

### 6.1 API Data Fetching Queries
```
Generate optimized SQL queries that the Next.js API routes will use to fetch data for each UI component. For example, a query to get the latest maturity scores for the `ExecutiveDashboardLayout`, or historical financial data for `FinancialImpactCharts`. Focus on efficient data retrieval, potentially using views or stored procedures to simplify complex joins and aggregations.
```

### 6.2 Real-time UI Data Subscriptions
```
Design a PostgreSQL-based mechanism for real-time updates to UI components, potentially using `LISTEN/NOTIFY` for event-driven updates. Generate SQL functions or triggers that notify the application layer when relevant data changes (e.g., a new maturity score is calculated), allowing the frontend to update dynamically without constant polling.
```
