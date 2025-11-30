# 🏗️ PROJECT SPECIFICATION: PlanLI Dates (PLD)

> **FOR AI AGENTS:** This file is the Source of Truth for the PlanLI Dates project. 
> Refer to this file for architecture, tech stack, data models, and the development roadmap.
> **Current Focus:** Phase 1 (Core Infrastructure & AI Proof).

---

## 1. Project Overview
**App Name:** PlanLI Dates (PLD)
**Slogan:** "הדרך החכמה להיפגש" (The smart way to meet).
**Core Value:** An AI-powered dating planner that finds the perfect meeting point ($L_{mid}$) between two users ($L_1, L_2$) and suggests a ranked list of venues based on shared preferences, powered by OpenAI.

**Folder Structure:**
- `/backend`: Node.js + Express application (API, Logic, DB connection).
- `/mobile-app`: React Native application (UI/UX).

---

## 2. Development Roadmap (MVP)

### 🟢 Phase 1: Core Infrastructure & AI Proof (CURRENT PHASE)
*Goal: Prove the AI logic works before polishing the UI.*

| Task ID | Task Name | Tech / Details |
| :--- | :--- | :--- |
| **1.1** | **Project Setup** | Initialize Node.js Express (Backend) & React Native (Mobile). Setup TypeScript. |
| **1.2** | **Auth Setup** | Integrate Firebase Auth (Basic Email/Password or Google). |
| **1.3** | **Data Modeling** | Create Mongoose Schemas: `User` (Profile), `Place` (Cache/Reviews). |
| **1.4** | **Geo-Logic** | Implement $L_{mid}$ (Midpoint) calculation logic in Backend. |
| **1.5** | **AI Logic (Core)** | **CRITICAL:** Build Endpoint taking 2 locations + preferences -> OpenAI API -> Returns JSON recommendations. |
| **1.6** | **Basic Input UI** | Simple "Ugly" screen to input 2 locations & trigger the AI. |

### 🟡 Phase 2: UI/UX & Map Integration
*Goal: Make it visual and interactive.*

| Task ID | Task Name | Tech / Details |
| :--- | :--- | :--- |
| **2.1** | **Google Maps** | Integrate Google Places Autocomplete & Map View. |
| **2.2** | **Map Pins** | Render $L_1, L_2, L_{mid}$ and Recommendation Pins on map. |
| **2.3** | **Results List** | BottomSheet displaying the AI recommendations. |
| **2.4** | **Reviews (Read)** | Backend endpoint to fetch reviews for a place. |
| **2.5** | **Place Details** | Full screen with AI rationale, photos, and reviews. |

### 🔴 Phase 3: Finalizing MVP (Loop)
*Goal: Close the product loop with user feedback.*

| Task ID | Task Name | Tech / Details |
| :--- | :--- | :--- |
| **3.1** | **Reviews (Write)** | Allow users to post reviews & ratings. |
| **3.2** | **Actions** | External links (Navigation, Table Booking). |
| **3.3** | **Polishing** | Apply "Heart Pin" branding, colors, and fonts. |
| **3.4** | **QA/E2E** | Full flow testing. |

---

## 3. Tech Stack & Architecture

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express.js (with TypeScript)
* **Database:** MongoDB (via Mongoose)
* **AI Engine:** OpenAI API (GPT-4o or Turbo)
* **Geo Data:** Google Maps Platform (Places API, Geocoding)
* **Auth:** Firebase Admin SDK

### Frontend (Client)
* **Framework:** React Native (TypeScript) - Expo is recommended for speed.
* **State Management:** Zustand
* **Maps:** React Native Maps
* **Navigation:** React Navigation

---

## 4. Core Logic Specifications

### A. The "Smart Match" Algorithm (Backend)
1.  **Receive Inputs:**
    * $L_1$ (User 1 Coords), $L_2$ (User 2 Coords).
    * $P_{core}$ (Preferences: e.g., "Wine Bar", "Vegan").
    * $P_{price}$ (Budget).
2.  **Calculate Midpoint ($L_{mid}$):**
    * Compute geographic center between $L_1$ and $L_2$.
    * Define Search Radius ($D_{max}$).
3.  **Fetch Candidates:**
    * Query Google Places API around $L_{mid}$ based on preferences.
    * Result: `CandidateList` (Array of raw places).
4.  **AI Analysis (The Brain):**
    * Send `CandidateList` + `UserPreferences` to OpenAI.
    * **System Prompt:** "You are an expert date planner. Select the top 5 venues from this list that best match the couple's vibe. Return a strict JSON array with Place ID, Match Score, and a personalized 'Why this place?' rationale."
5.  **Response:**
    * Return the JSON to the client.

---

## 5. Design & Branding Assets

* **Primary Color (Ruby Red):** `#C2185B`
* **Secondary Color (Hot Pink):** `#FF4081`
* **Text Color (Dark Grey):** `#263238`
* **Logo Concept:** "The Heart Pin" - A map location pin where the head is a heart shape, featuring a smiling/friendly character style (Cartoonish/Modern Flat).
* **Vibe:** Fun, Smart, Romantic, Efficient.

---

## 6. Data Models (Mongoose Drafts)

**User Schema:**
```typescript
{
  uid: String, // Firebase UID
  email: String,
  name: String,
  savedLocations: [{ label: String, coords: [Number] }]
}
