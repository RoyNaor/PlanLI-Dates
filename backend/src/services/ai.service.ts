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
  lmid: Coordinates,
  preferences: string
): Promise<AiRecommendation[]> => {
  try {
    console.log('AI Suggestions is loading');
    const prompt = `
      Coordinates: Latitude ${lmid.lat}, Longitude ${lmid.lng}.
      Preferences: ${preferences || "General date spots, romantic, safe"}.
    `;
    console.log('AI Prompt:', prompt);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert dating concierge. Based on the provided coordinates (Latitude, Longitude), suggest 3 specific real venues nearby that match the user preferences. You must return strict JSON. Output format: { \"recommendations\": [{ \"name\": \"...\", \"address\": \"...\", \"description\": \"...\", \"matchScore\": 95 }] }"
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
