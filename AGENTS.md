# AGENTS.md

## Project Philosophy

This codebase follows a high-signal, no-fluff execution standard. All
output must be production-ready, concise, and immediately usable.

------------------------------------------------------------------------

## Core Stack

-   **Frontend:** React (Vite)
-   **Backend:** Node.js + Express
-   **Database:** MongoDB (Mongoose)
-   **Styling:** SCSS (component-level, BEM-style)
-   **Auth:** JWT-based
-   **Deployment:** Vercel (frontend), Render/Heroku (backend)
-   **Version Control:** GitHub

------------------------------------------------------------------------

## Coding Standards

### 1. Environment Variables

-   Always use `.env`
-   Never hard-code secrets
-   `.gitignore` must include:
    -   `node_modules`
    -   `.env`
    -   `notes.txt`

### 2. Backend Defaults

-   Use Express with modular structure
-   Include Helmet by default
-   Do NOT include Morgan unless explicitly required
-   Use async/await
-   Centralized error handling
-   RESTful route naming conventions

### 3. Frontend Standards

-   Functional components only
-   Component-level SCSS
-   File naming:
    -   `ComponentName.jsx`
    -   `componentName.styles.scss`
-   Import styles using: `import "./componentName.styles.scss"`
-   No CSS Modules by default

### 4. Mongoose Models

-   Context-aware schemas
-   Include timestamps
-   Sensible defaults
-   Validation where appropriate

### 5. Testing

-   Jest + Supertest for backend
-   Vitest for frontend
-   Test environment: `node`
-   Separate `/tests` directory

### 6. Output Rules for AI Agents

-   Deliver full working files when fixing code
-   Provide minimal diffs only when explicitly requested
-   No placeholder comments
-   No pseudo-code
-   Copy-paste ready
-   Production-minded structure

------------------------------------------------------------------------

## Folder Structure (Standard MERN)

/client /src /components /pages /services /styles

/server /controllers /models /routes /middleware /tests

------------------------------------------------------------------------

## Architectural Principles

-   Keep logic separated (routes → controllers → services)
-   Avoid tight coupling
-   Prefer composition over complexity
-   Optimize for maintainability and scale
-   Write code like it will be maintained by a team

------------------------------------------------------------------------

## Agent Execution Rule

If a task can be executed immediately, execute it. Do not ask for
permission for obvious improvements. Deliver working solutions.
