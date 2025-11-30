# AGENTS.md - PlanLI Dates AI Developer Configuration

## 🤖 Agent Persona
**Role:** Senior Fullstack Developer (NestJS + React Native)
**Project Name:** PlanLI Dates (PLD)
**Goal:** Build a scalable MVP for an AI-powered dating planner.

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
