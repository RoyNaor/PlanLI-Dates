import OpenAI from 'openai';
import { Coordinates } from '../utils/geo.utils';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. הממשק החדש והמורחב
export interface AiRecommendation {
  name: string;
  search_query: string;
  description: string;
  matchScore: number;
  category: 'Food' | 'Drink' | 'Activity' | 'Nature' | 'Culture';
  timeOfDay: 'Day' | 'Night' | 'Any';
}

export const generateDateIdeas = async (
  center: Coordinates,
  preferences: string,
  strategy: string,
  radius: number
): Promise<AiRecommendation[]> => {
  try {
    const strategyContext =
      strategy === 'NEAR_ME' ? "Focus on the area of User 1 (The Host)." :
      strategy === 'NEAR_THEM' ? "Focus on the area of User 2 (The Guest)." :
      "Find a fair meeting point in the middle.";

    const systemPrompt = `
      You are an elite Date Planner & Local Concierge.
      
      **The Mission:** Curate a list of 6-8 high-quality date venues based on coordinates and a "Vibe".
      
      **The Categories:**
      1. **Food & Drink:** Restaurants, Wine Bars, Dessert spots, Bars.
      2. **Nature & Views:** Scenic lookouts (Mitzpe), Parks, Beach promenades, Hidden gardens.
      3. **Active & Fun:** Bowling, Paint Bars, Escape Rooms, Workshops, Billiards, Cinemas.
      4. **Culture:** Open-air cinemas, Art galleries, Museums.

      **Rules:**
      - **Accuracy:** Suggest REAL, well-known places. If the area is remote, suggest the closest famous landmarks.
      - **Search Query:** The 'search_query' field must be optimized for Google Maps API (e.g., instead of just "Park", use "HaYarkon Park Tel Aviv").
      - **Audience Fit:** Its for Couples! its a DATE!.
      
      **Output Format:** Return strict JSON: 
      { 
        "recommendations": [
          { 
            "name": "Name of Place", 
            "search_query": "Name + City", 
            "description": "Why is this good for this specific vibe? (Max 15 words)", 
            "matchScore": 85-100,
            "category": "Food" | "Drink" | "Activity" | "Nature" | "Culture",
            "timeOfDay": "Day" | "Night" | "Any"
          }
        ] 
      }
    `;

    const userPrompt = `
      **Context:**
      - Coordinates: ${center.lat}, ${center.lng}
      - Radius: ${radius} meters (You can expand up to 2x if the area is sparse).
      - Strategy: ${strategy} (${strategyContext})
      
      **User Preferences / Vibe:** "${preferences || "General romantic date"}"
      
      GENERATE THE LIST NOW.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-4o", 
      response_format: { type: "json_object" },
      temperature: 0.7, // הוספנו קצת יצירתיות, אבל לא יותר מדי
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);

    // ולידציה בסיסית שאנחנו מקבלים מערך
    if (result.recommendations && Array.isArray(result.recommendations)) {
      return result.recommendations as AiRecommendation[];
    } else {
        console.warn("AI returned unexpected JSON structure", result);
        return [];
    }

  } catch (error) {
    console.error("Error generating date ideas:", error);
    return [];
  }
};