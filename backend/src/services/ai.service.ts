import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Coordinates } from '../utils/geo.utils';
import { searchSimilarPlaces, savePlaceToPinecone } from './pinecone.service';
import { searchGooglePlaces, GooglePlace } from './google-maps.service';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AiRecommendation {
  name: string;
  search_query: string;
  description: string;
  matchScore: number;
  category: "Food" | "Drink" | "Activity" | "Nature" | "Culture";
  timeOfDay: "Day" | "Night" | "Any";
  placeDetails?: any;
}

export const generateDateIdeas = async (
  center: Coordinates,
  preferences: string,
  strategy: string,
  radius: number
): Promise<AiRecommendation[]> => {
  try {
    console.log("🤔 AI Agent started...");
    console.log(`📍 Input: ${preferences}`);

    const cachedPlaces = await searchSimilarPlaces(preferences, center, radius);

    if (cachedPlaces.length >= 4) {
        console.log(`✨ CACHE HIT! Found ${cachedPlaces.length} places in Pinecone.`);
        
        return cachedPlaces.map((place: any) => ({
            name: place.name,
            search_query: `${place.name} ${place.vicinity}`,
            description: place.richDescription,
            matchScore: Math.round(place.matchScore || 85),
            category: mapTypesToCategory(place.types), 
            timeOfDay: 'Any', 
            placeDetails: {
                place_id: place.place_id,
                name: place.name,
                geometry: { location: { lat: place.lat, lng: place.lng } },
                formatted_address: place.vicinity,
                rating: place.rating,
                user_ratings_total: place.user_ratings_total
            }
        }));
    }

    console.log("🌍 CACHE MISS (or low). Calling Google Maps API...");
    
    const googleQuery = await generateGoogleQuery(preferences);
    
    const googleResults = await searchGooglePlaces(googleQuery, center, radius);
    
    const topResults = googleResults.slice(0, 6);

    const processedResults = await Promise.all(topResults.map(async (place) => {
        const richDescription = await generateRichDescription(place, preferences);
        
        await savePlaceToPinecone(place, richDescription);

        return {
            name: place.name,
            search_query: `${place.name} ${place.formatted_address}`,
            description: richDescription,
            matchScore: calculateDynamicScore(place.rating), 
            category: mapTypesToCategory(place.types.join(', ')),
            timeOfDay: determineTimeOfDay(place.types),
            placeDetails: place
        } as AiRecommendation;
    }));

    return processedResults;

  } catch (error) {
    console.error("❌ Error in AI Agent:", error);
    return [];
  }
};

// --- Helper Functions  ---
function mapTypesToCategory(types: string): any {
    const t = types.toLowerCase();
    
    if (t.includes('movie_theater') || t.includes('cinema') || t.includes('museum') || t.includes('art_gallery')) return 'Culture';
    if (t.includes('park') || t.includes('camp') || t.includes('natural') || t.includes('tourist_attraction')) return 'Nature';
    if (t.includes('bar') || t.includes('night_club') || t.includes('pub') || t.includes('wine')) return 'Drink';
    
    if (t.includes('restaurant') || t.includes('food') || t.includes('bakery') || t.includes('cafe') || t.includes('meal_takeaway')) return 'Food';
    
    return 'Activity';
}

function determineTimeOfDay(types: string[]): "Day" | "Night" | "Any" {
    const t = types.join(' ').toLowerCase();
    if (t.includes('bar') || t.includes('night_club') || t.includes('pub')) return 'Night';
    if (t.includes('park') || t.includes('cafe') || t.includes('bakery')) return 'Day';
    return 'Any';
}

function calculateDynamicScore(rating?: number): number {
    if (!rating) return 85;
    return Math.min(99, Math.round(rating * 10 + 45 + (Math.random() * 5))); 
}

async function generateGoogleQuery(preferences: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [
            { 
                role: "system", 
                content: `You are a query optimizer for Google Maps Places API.
                INPUT: User preferences string (e.g., "$$ budget. Vibe: Romantic. Cuisine: Italian, Asian").
                OUTPUT: A clean, effective search query string.
                
                RULES:
                1. Combine "Vibe" and "Cuisine" smartly.
                2. Use "OR" logic for multiple cuisines.
                3. If the vibe is "Coffee Cart", search for "Coffee cart" or "Food truck".
                4. If the vibe/activity is "Movie", search for "Cinema" or "Movie Theater".
                5. Keep it short (max 5-6 words).
                
                Examples:
                In: "Vibe: Casual. Cuisine: Cafe." -> Out: "Coffee shop or Cafe"
                In: "Vibe: Coffee Cart." -> Out: "Coffee Cart or Food Truck"  <-- הוספנו דוגמה ספציפית
                In: "Vibe: Romantic. Cuisine: Italian." -> Out: "Romantic Italian Restaurant"
                In: "Vibe: Fun. Cuisine: Movie." -> Out: "Cinema or Movie Theater" <-- הוספנו דוגמה ספציפית
                ` 
            }, 
            { role: "user", content: preferences }
        ]
    });
    return response.choices[0].message.content || "Date spots";
}

async function generateRichDescription(place: GooglePlace, userPrefs: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a copywriter for a dating app. Write a 1-sentence catchy description. If it's a Coffee Cart, mention it's great for a casual outdoor date. If it's a Cinema, mention the viewing experience."
            },
            { 
                role: "user", 
                content: `Venue: ${place.name} (${place.types.join(', ')}). User Vibe: ${userPrefs}. Write a description.` 
            }
        ]
    });
    return response.choices[0].message.content || `${place.name} is a great spot matching your vibe.`;
}