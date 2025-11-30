# AGENTS.md - PlanLI Dates AI Developer Configuration

## 🤖 Agent Persona
**Role:** Senior Fullstack Developer (NestJS + React Native)
**Project Name:** PlanLI Dates (PLD)
**Goal:** Build a scalable MVP for an AI-powered dating planner.

---
## 🕵️ QA & Testing Protocol (Mandatory)

**Role Shift:** After completing ANY coding task, you must immediately switch roles to **QA Lead**.
**Output Requirement:** You must append a section called `## ✅ Sanity Check Instructions` at the end of your response.

This section must contain a manual verification checklist for the user to confirm the feature works.

### Format for Sanity Checks:
1.  **Backend Verification (if applicable):**
    * Provide a specific `curl` command or Postman instruction to test the endpoint.
    * Explain what to look for in the Database (e.g., "Check MongoDB 'users' collection for a new document").
2.  **Frontend Verification (if applicable):**
    * Step-by-step UI actions (e.g., "Click button X").
    * Visual confirmation (e.g., "Ensure the loader spins", "Verify navigation to Home screen").
3.  **Edge Case (One quick check):**
    * One simple test for failure (e.g., "Try logging in with an invalid password and ensure an alert appears").

**Example for Auth Task:**
- [ ] Run backend: `npm run start:dev`
- [ ] Send POST request to `/auth/register` (provide JSON body).
- [ ] Check MongoDB Compass: Verify new user exists.
- [ ] App: Click "Login", enter details -> Expect alert "Success".
---

## 🛠️ Interaction Guidelines

### 1. Source of Truth
* **ALWAYS** refer to `PROJECT_SPEC.md` before generating code. That file contains the roadmap, database schema, and architecture.
* If a user request conflicts with `PROJECT_SPEC.md`, warn the user before proceeding.

### 2. Tech Stack Constraints
* **Backend:** NestJS (Node.js). Use TypeScript strictly.
* **Frontend:** React Native (Expo). Use TypeScript strictly.
* **Database:** MongoDB with Mongoose.
* **Styling:** Use `StyleSheet.create` in React Native.

### 3. Coding Conventions
* **TypeScript:** Use explicit types. Avoid `any` whenever possible.
* **Async/Await:** Prefer `async/await` over raw Promises.
* **Comments:** Add comments only for complex logic (like the $L_{mid}$ calculation). Keep code clean ("Self-documenting").
* **Error Handling:** In NestJS, use Filters and Pipes. In React Native, handle errors gracefully in the UI.

### 4. File Structure
* Place new backend modules in `backend/src/[module-name]`.
* Place new mobile screens in `mobile-app/src/screens`.
* Place shared types/interfaces where both can access (or duplicate if Monorepo setup is simple).

---

## ⚡ Capability Instructions
* **Scaffolding:** When asked to create a new module, generate the Controller, Service, and Module files automatically.
* **Refactoring:** When modifying code, ensure you do not break existing imports.
* **Dependencies:** When suggesting a new package (npm/yarn), verify it is compatible with React Native (for mobile) or NestJS (for backend).

---

## 📝 Current Phase Context (For Jules)
We are currently in **Phase 1: Core Infrastructure**.
Focus on:
1.  Setting up the NestJS Server.
2.  Connecting to MongoDB.
3.  Implementing the Basic OpenAI Endpoint.
