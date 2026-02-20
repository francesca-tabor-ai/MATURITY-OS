# Prompt Engineering: Module 5.1 — Live Maturity Monitoring™

## 1. Module Description
This module provides continuous, real-time tracking of an organisation's data and AI maturity changes over time. It integrates with various data sources to automatically update maturity scores, offering up-to-the-minute insights into an organisation's progress and potential regressions.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (For real-time data visualization assets)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Real-time Data Ingestion and Processing
```
Develop a Python service `LiveMaturityMonitor` that can ingest streaming data from various sources (e.g., Kafka, message queues) representing changes in an organisation's data and AI landscape. This service should process incoming events, extract relevant metrics, and trigger updates to the data and AI maturity scores. Focus on low-latency processing and fault tolerance. Consider using a lightweight stream processing library.
```

### 3.2 Incremental Maturity Score Updates
```
Create a Python function `update_maturity_scores_incrementally` that takes partial updates or new data points related to an organisation's data/AI practices. Instead of re-running a full audit, this function should incrementally adjust the existing data and AI maturity scores based on the new information. Define the logic for how specific changes (e.g., new data source integration, AI model deployment) impact the overall scores.
```

### 3.3 Anomaly Detection for Maturity Changes
```
Implement a Python function `detect_maturity_anomalies` that monitors the stream of maturity score updates. This function should identify significant deviations or unexpected drops/spikes in an organisation's data or AI maturity scores. Use statistical methods (e.g., moving averages, standard deviation thresholds) to flag anomalies and trigger alerts. The output should include the anomaly type and its severity.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Real-time Maturity Dashboard Component
```
Develop a React component `LiveMaturityDashboard` that displays an organisation's data and AI maturity scores in real-time. This component should feature dynamic charts (e.g., line graphs) showing trends over time, current scores, and any detected anomalies. Use WebSockets or server-sent events to push updates to the frontend. Use Tailwind CSS for styling and ensure responsiveness.
```

### 4.2 Real-time Data API Endpoint
```
Generate a Next.js API route `/api/live-maturity-feed` that acts as a WebSocket endpoint or provides server-sent events. This endpoint should stream real-time maturity updates and anomaly alerts from the `LiveMaturityMonitor` service to connected clients. Implement secure authentication and authorization for accessing the real-time feed.
```

## 5. Prompt Engineering for Runway (Real-time Data Visualization)

### 5.1 Dynamic Line Graph for Maturity Trends
```
Generate an animated line graph visualization that displays the historical and real-time trend of an organisation's data and AI maturity scores. The graph should smoothly update as new data points arrive, highlighting recent changes and allowing users to zoom into specific time periods. Use distinct colors for data and AI maturity, and include markers for detected anomalies. The visualization should be suitable for web embedding.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Time-Series Maturity Data Storage Schema
```
Design a PostgreSQL database schema to store time-series data for live maturity monitoring. Create a table `maturity_snapshots` that includes `organisation_id`, `timestamp`, `data_maturity_index`, `ai_maturity_score`, and a JSONB column for any additional real-time metrics. Ensure efficient indexing for time-based queries and proper foreign key relationships.
```

### 6.2 Real-time Data Access Queries
```
Generate SQL queries to retrieve the latest maturity scores for an organisation, fetch historical maturity trends within a specific time window, and query for detected anomalies. Focus on optimized queries for high-frequency data access and aggregation for real-time dashboards.
```
