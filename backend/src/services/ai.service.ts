import OpenAI from 'openai';
import { Coordinates } from '../utils/geo.utils';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AiRecommendation {
  name: string;
  address: string;
  description: string;
  matchScore: number;
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

    const prompt = `
      Coordinates: Latitude ${center.lat}, Longitude ${center.lng}.
      Search Radius: ${radius} meters.
      Strategy: ${strategy} (${strategyContext}).
      Preferences: ${preferences || "General date spots, romantic, safe"}.
    `;

    const systemPrompt = `You are an expert local guide.
    Task: Suggest 3 venues. IMPORTANT: You must prioritize well-established, long-standing venues to avoid suggesting places that might have permanently closed recently.
    Context: ${strategyContext}
    Based on the provided coordinates (Latitude, Longitude), suggest 3 specific real venues nearby that match the user preferences.
    You must return strict JSON. Output format: { "recommendations": [{ "name": "...", "address": "...", "description": "...", "matchScore": 95 }] }`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: prompt }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);

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
