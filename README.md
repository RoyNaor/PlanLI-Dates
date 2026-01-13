# 🏗️ PROJECT SPECIFICATION: PlanLI Dates (PLD)

---

## 1. Project Overview
**App Name:** PlanLI Dates (PLD)
**Slogan:** "הדרך החכמה להיפגש" (The smart way to meet).
**Core Value:** An AI-powered dating planner that finds the perfect meeting point ($L_{mid}$) between two users ($L_1, L_2$) and suggests a ranked list of venues based on shared preferences, powered by OpenAI and Vector Search.

**Folder Structure:**
- `/backend`: Node.js + Express application (API, Logic, DB connection).
- `/mobile-app`: React Native application (UI/UX).

---

## 2. Development Roadmap (MVP)

### 🟢 Phase 1: Core Infrastructure & AI Proof 
*Goal: Prove the AI logic works before polishing the UI.*

| Task ID | Task Name | Tech / Details |
| :--- | :--- | :--- |
| **1.1** | **Project Setup** | Initialize Node.js Express (Backend) & React Native (Mobile). Setup TypeScript. |
| **1.2** | **Auth Setup** | Integrate Firebase Auth (Basic Email/Password). |
| **1.3** | **Data Modeling** | Create Mongoose Schemas (`User`, `Place`) & Pinecone Index. |
| **1.4** | **Geo-Logic** | Implement $L_{mid}$ (Midpoint) calculation logic in Backend. |
| **1.5** | **AI Logic (Core)** | **CRITICAL:** Build Hybrid Search (Pinecone + Google Maps) -> OpenAI Reranking. |
| **1.6** | **Basic Input UI** | Simple screen to input 2 locations & trigger the AI. |

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
* **Database (Primary):** MongoDB (via Mongoose)
* **Vector Database:** **Pinecone** (Serverless) - Stores embeddings for semantic search.
* **AI Engine:** OpenAI API
    *   **Embeddings:** `text-embedding-3-small`
    *   **LLM:** `gpt-4o-mini`
* **Geo Data:** Google Maps Platform (Places API, Geocoding)
* **Auth:** Firebase Admin SDK

### Frontend (Client)
* **Framework:** React Native (Expo) with TypeScript.
* **Maps:** `react-native-maps`, `react-native-google-places-autocomplete`.
* **Localization:** `i18next`, `expo-localization`.
* **Auth:** Firebase JS SDK.

---

## 4. Core Logic Specifications

### A. The "Smart Match" Algorithm (Hybrid Vector Search)
The backend uses a hybrid approach combining Vector Search (Pinecone) and Live API Search (Google Maps) to optimize for quality and cost.

1.  **Receive Inputs:**
    *   $L_1, L_2$ (User Locations) -> Calculate $L_{mid}$ (Midpoint).
    *   `UserPreferences` (e.g., "Romantic Italian dinner").
    *   `Radius`, `TimeOfDay`.

2.  **Step 1: Vector Cache Search (Pinecone)**
    *   **Embed:** Convert `UserPreferences` to vector using `text-embedding-3-small`.
    *   **Query:** Search Pinecone index (`planli-places`) near $L_{mid}$.
    *   **Filter:** Apply cuisine/category filters if extracted from text.
    *   **Outcome:** If $\ge 6$ high-quality matches found, return them (**Full Cache Hit**).

3.  **Step 2: Google Maps Fallback (Partial/No Hit)**
    *   If Pinecone returns $< 6$ results:
    *   **Generate Query:** Use `gpt-4o-mini` to convert user vibe into a Google Places keyword query (e.g., "Cozy Italian Restaurant").
    *   **Search:** specific Google Places API Text Search.
    *   **Enrich:** For each new place found:
        *   Generate **"Rich Description"** using `gpt-4o-mini` (e.g., "A candlelit spot perfect for a first date.").
        *   **Embed & Save:** Save vector to Pinecone (searchable future cache) and details to MongoDB.

4.  **Step 3: Response Construction**
    *   Merge Pinecone and Google results.
    *   Deduplicate by `googlePlaceId`.
    *   Sort by `matchScore` (Cosine Similarity or Dynamic Score).
    *   Return top 6 recommendations.

---

## 5. Design & Branding Assets

* **Primary Color (Ruby Red):** `#C2185B`
* **Secondary Color (Hot Pink):** `#FF4081`
* **Text Color (Dark Grey):** `#263238`
* **Logo Concept:** "The Heart Pin" - A map location pin where the head is a heart shape.
* **Vibe:** Fun, Smart, Romantic, Efficient.

---

## 6. Data Models

### A. MongoDB (Mongoose)

**User Schema (`User`):**
```typescript
{
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  savedLocations: [{
    label: String,
    coords: [Number] // [lat, lng]
  }]
}
```

**Place Schema (`Place`):**
*Stores raw details to reduce Google API calls (Detail Cache).*
```typescript
{
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { lat: Number, lng: Number },
  address: String,
  rating: Number,
  userRatingsTotal: Number,
  types: [String],
  photos: [{
    photo_reference: String,
    height: Number,
    width: Number
  }],
  reviews: [{
    author_name: String,
    rating: Number,
    text: String,
    time: Number
  }],
  cachedAt: { type: Date, expires: '7d' } // Auto-delete after 7 days
}
```

### B. Pinecone Index (`planli-places`)

* **Vector:** 1536 dimensions.
* **Metadata Fields:**
    *   `name`, `vicinity`
    *   `rating`, `user_ratings_total`
    *   `types` (Array)
    *   `richDescription` (AI-generated vibe summary)
    *   `category` (Food/Drink/Activity)
    *   `lat`, `lng`
