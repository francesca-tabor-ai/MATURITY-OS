# Prompt Engineering: Core Module 0.1 — Identity & Organisation Management

## 1. Module Description
This module focuses on establishing the foundational identity and organisation management capabilities for MATURITY OS™. It includes user authentication, role-based access control, organisation profiles, multi-organisation support, and team management features. It also defines the core data points collected for each organisation.

## 2. Tech Stack Focus
*   **IDE/Development:** Cursor
*   **Deployment/Hosting:** Vercel
*   **Media/Video:** Runway (Limited applicability for this module, primarily for UI/UX assets if any)
*   **Database:** PostgreSQL

## 3. Prompt Engineering for Cursor (Code Generation)

### 3.1 User Authentication
```
Generate a Next.js API route and frontend components for user authentication. Support SSO (with Google OAuth), email/password login, and OAuth (GitHub). Use NextAuth.js for authentication. Include secure password hashing (bcrypt) and JWT token generation. The frontend should have login, registration, and password reset forms. Ensure proper error handling and session management.
```

### 3.2 Role-Based Access Control (RBAC)
```
Design and implement a role-based access control system for a Next.js application. Define roles: Executive, Analyst, Investor, Consultant. Create middleware to protect API routes and frontend pages based on user roles. Provide examples of how to check user roles in both server-side and client-side components. Integrate with the NextAuth.js session object to store user roles.
```

### 3.3 Organisation Profiles & Multi-Organisation Support
```
Develop a full-stack solution for managing organisation profiles in a Next.js application. Each user can belong to multiple organisations. Implement features for creating, viewing, editing, and deleting organisation profiles. Include fields for company size, industry, revenue, geography, and employee count. Ensure that users can switch between active organisations. Generate API routes for CRUD operations and corresponding React components for the UI.
```

### 3.4 Team Invitations and Permissions
```
Create a system for inviting team members to an organisation and managing their permissions. Implement an invitation flow using email (e.g., SendGrid integration). Invited users should be assigned a specific role upon acceptance. Provide functionality for organisation administrators to view, revoke, and modify team member roles and permissions. Generate necessary API endpoints and React components.
```

## 4. Prompt Engineering for Vercel (Deployment/Frontend)

### 4.1 Deployment Configuration
```
Provide a `vercel.json` configuration for a Next.js application that includes serverless functions for API routes, environment variable management, and custom domain setup. Ensure optimal performance and security settings for a production environment.
```

### 4.2 Frontend Components & Pages
```
Develop a responsive and accessible user interface for the identity and organisation management features. Create React components for: Login/Registration forms, Organisation Dashboard, Team Management table, and Organisation Profile editor. Use Tailwind CSS for styling. Ensure forms have client-side validation and clear feedback messages.
```

## 5. Prompt Engineering for Runway (Media/AI-generated assets)

### 5.1 UI/UX Assets (Optional)
```
Generate abstract background images or icons for the MATURITY OS™ login page and organisation dashboard, reflecting themes of data, AI, and growth. Focus on a professional, modern aesthetic. Provide variations in color schemes.
```

## 6. Prompt Engineering for PostgreSQL (Database Schema/Queries)

### 6.1 Database Schema Design
```
Design a PostgreSQL database schema for user authentication, role-based access control, and organisation management. Include tables for `users`, `organisations`, `user_organisations` (junction table for many-to-many relationship), `roles`, and `invitations`. Define appropriate data types, primary keys, foreign keys, and indexes. Consider fields for user details, organisation metadata (company size, industry, revenue, geography, employee count), and invitation tokens.
```

### 6.2 CRUD Operations & Relationship Queries
```
Generate SQL queries for common CRUD operations on the `users`, `organisations`, and `user_organisations` tables. Include queries to:
1.  Retrieve a user's roles across all organisations.
2.  Fetch all members of a specific organisation with their roles.
3.  Update an organisation's profile details.
4.  Insert a new user and associate them with an organisation.
5.  Retrieve all organisations a specific user belongs to.
```
