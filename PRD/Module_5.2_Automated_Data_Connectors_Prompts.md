# Prompt Engineering: Module 5.2 — Automated Data Connectors™

## 1. Module Description
This module provides automated data connectors to various enterprise data sources (e.g., Snowflake, Databricks, AWS, Azure, Salesforce). These connectors automatically ingest data relevant to maturity assessment, enabling continuous and real-time updates of an organisation's data and AI maturity scores without manual intervention.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (Limited applicability, perhaps for connector iconography)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 Snowflake Data Connector
```
Develop a Python class `SnowflakeConnector` that can securely connect to a Snowflake data warehouse. This class should include methods to:
1.  Authenticate using service accounts or OAuth.
2.  List available databases, schemas, and tables.
3.  Execute SQL queries to extract specific data points relevant to data and AI maturity assessment (e.g., table sizes, query history, user activity).
4.  Handle data pagination and schema evolution. Ensure robust error handling and logging.
```

### 3.2 AWS Data Connector
```
Create a Python class `AWSConnector` that can connect to various AWS services (e.g., S3, Redshift, Glue, SageMaker). This class should provide methods to:
1.  Authenticate using IAM roles or access keys.
2.  Retrieve metadata from S3 buckets (e.g., file counts, sizes, last modified dates).
3.  Query Redshift data warehouses.
4.  Monitor Glue job runs and SageMaker endpoint usage. Focus on extracting metrics indicative of data volume, processing, and AI model deployment.
```

### 3.3 Salesforce Data Connector
```
Write a Python class `SalesforceConnector` that can connect to Salesforce via its API. This class should include methods to:
1.  Authenticate using OAuth 2.0.
2.  Query Salesforce objects (e.g., Accounts, Opportunities, Custom Objects) to extract CRM data relevant to business processes and data usage.
3.  Handle API rate limits and data type conversions. Focus on extracting data that can inform data governance and data accessibility metrics.
```

### 3.4 Generic Data Ingestion Pipeline
```
Design a generic Python data ingestion pipeline that can be configured to use different data connectors (e.g., SnowflakeConnector, AWSConnector). The pipeline should:
1.  Read configuration specifying the data source, connection details, and data extraction queries/logic.
2.  Use the appropriate connector to extract data.
3.  Transform the extracted data into a standardized format for maturity assessment.
4.  Push the transformed data to a message queue or directly to the `LiveMaturityMonitor` service for incremental updates. Implement scheduling and retry mechanisms.
```

## 4. Prompt Engineering for Vercel (Frontend/API)

### 4.1 Connector Configuration UI
```
Develop a React component `DataConnectorConfigurator` that allows users to configure and manage automated data connectors. This component should provide forms for entering connection details (e.g., API keys, credentials, endpoint URLs) for various data sources (Snowflake, AWS, Salesforce). It should include validation for input fields and display connection status. Use Tailwind CSS for styling and ensure secure handling of sensitive information.
```

### 4.2 Connector Management API
```
Generate a Next.js API route `/api/data-connectors` that handles CRUD operations for data connector configurations. This endpoint should securely store connection details (e.g., encrypted in a database), validate inputs, and trigger the generic data ingestion pipeline for new or updated connectors. Implement proper authentication and authorization.
```

## 5. Prompt Engineering for Runway (Connector Iconography)

### 5.1 Data Source Icons
```
Generate a set of modern, minimalist icons for various data sources: Snowflake, Databricks, AWS, Azure, Salesforce. Each icon should be distinct yet cohesive in style, suitable for use in a web application's UI to represent different data connectors.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Connector Configuration Storage Schema
```
Design a PostgreSQL database schema to securely store data connector configurations. Create a table `data_connectors` that includes `organisation_id`, `connector_type` (e.g., 'Snowflake', 'AWS'), `connection_details` (JSONB, encrypted), `last_sync_date`, and `status`. Ensure proper foreign key relationships and data types. Emphasize security considerations for storing credentials.
```

### 6.2 Connector Monitoring Queries
```
Generate SQL queries to retrieve the status of all data connectors for an organisation, identify connectors that have failed or are out of sync, and track the volume of data ingested by each connector over time. Include queries to audit access to connection details.
```
