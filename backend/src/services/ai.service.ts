import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Coordinates } from '../utils/geo.utils';
import { searchSimilarPlaces, savePlaceToPinecone } from './pinecone.service';
import { searchGooglePlaces, GooglePlace } from './google-maps.service';
import PlaceStats from '../models/PlaceStats';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface AiRecommendation {
  name: string;
  search_query: string;
  description: string;
  matchScore: number;
  category: 'Food' | 'Drink' | 'Activity' | 'Nature' | 'Culture';
  timeOfDay: 'Day' | 'Night' | 'Any';
  imageUrls: string[];
  placeDetails?: {
    place_id: string;
    planLi?: {
        rating: number;
        reviewCount: number;
    };
    [key: string]: any;
  };
}

const buildPhotoUrl = (photoRef?: string): string | null => {
  if (!photoRef || !GOOGLE_KEY) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_KEY}`;
};

export const generateDateIdeas = async (
  center: Coordinates,
  preferences: string,
  strategy: string,
  radius: number
): Promise<AiRecommendation[]> => {
  try {
    console.log('🤔 AI Agent started...');
    console.log(`📍 Input: ${preferences}`);

    const cachedPlaces = await searchSimilarPlaces(preferences, center, radius);

    const cuisineKeywords = extractCuisineKeywords(preferences);
    let validCachedPlaces: any[] = cachedPlaces;

    if (cuisineKeywords.length > 0) {
      console.log(
        `🔎 Filtering Cache for specific cuisine: ${cuisineKeywords.join(', ')}`
      );

      const filtered = cachedPlaces.filter((place: any) =>
        matchesCuisine(place, cuisineKeywords)
      );

      console.log(
        `📊 Filter results: Started with ${cachedPlaces.length}, remained with ${filtered.length}`
      );

      if (filtered.length > 0) {
        validCachedPlaces = filtered;
      } else {
        console.log(
          `⚠️ Cuisine filter returned 0 results – falling back to all cached places.`
        );
      }
    }

    validCachedPlaces = [...validCachedPlaces].sort(
      (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
    );

    const cachedRecommendations: AiRecommendation[] = validCachedPlaces
      .slice(0, 6) 
      .map((place: any) => {
        const rawScore = Math.round(place.matchScore || 85);
        const normalizedScore = Math.max(70, Math.min(rawScore, 99)); 

        return {
          name: place.name,
          search_query: `${place.name} ${place.vicinity ?? ''}`.trim(),
          description: place.richDescription,
          matchScore: normalizedScore,
          category: mapTypesToCategory(place.types),
          timeOfDay: 'Any',
          imageUrls: (place.photo_references || [])
            .map(buildPhotoUrl)
            .filter(
              (url: string | null): url is string =>
                url !== null
            ),
          placeDetails: {
            place_id: place.place_id,
            name: place.name,
            geometry: { location: { lat: place.lat, lng: place.lng } },
            formatted_address: place.vicinity,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total
          }
        };
      });

    if (cachedRecommendations.length === 6) {
      console.log(
        `✨ FULL CACHE HIT! Using 6 places from Pinecone (out of ${validCachedPlaces.length} valid, ${cachedPlaces.length} total).`
      );
      return cachedRecommendations;
    }

    if (cachedRecommendations.length === 0) {
      console.log(
        '🌍 CACHE MISS (no valid cached places). Calling Google Maps API...'
      );
    } else {
      console.log(
        `🌍 PARTIAL CACHE HIT (${cachedRecommendations.length} from Pinecone). Calling Google Maps API to complete to 6...`
      );
    }


    const googleQuery = await generateGoogleQuery(preferences);
    const googleResults = await searchGooglePlaces(googleQuery, center, radius);

    const topResults = googleResults.slice(0, 10);

    const processedGoogleResults: AiRecommendation[] = await Promise.all(
      topResults.map(async (place) => {
        const richDescription = await generateRichDescription(
          place,
          preferences
        );

        await savePlaceToPinecone(place, richDescription);

        const photoRefs =
          place.photos?.slice(0, 5).map((p) => p.photo_reference) || [];

        return {
          name: place.name,
          search_query: `${place.name} ${place.formatted_address}`,
          description: richDescription,
          matchScore: calculateDynamicScore(place.rating),
          category: mapTypesToCategory(place.types.join(', ')),
          timeOfDay: determineTimeOfDay(place.types),
          imageUrls: photoRefs
            .map(buildPhotoUrl)
            .filter(
              (url: string | null): url is string =>
                url !== null
            ),
          placeDetails: place
        } as AiRecommendation;
      })
    );

    const existingIds = new Set(
      cachedRecommendations
        .map((r) => r.placeDetails?.place_id)
        .filter(Boolean) as string[]
    );

    const googleWithoutDuplicates = processedGoogleResults.filter(
      (r) =>
        !r.placeDetails?.place_id ||
        !existingIds.has(r.placeDetails.place_id)
    );

    const finalRecommendations = [
      ...cachedRecommendations,
      ...googleWithoutDuplicates
    ].slice(0, 6);

    const placeIds = finalRecommendations.map(r => r.placeDetails?.place_id).filter(Boolean);
    const statsList = await PlaceStats.find({ googlePlaceId: { $in: placeIds } });

    const statsMap = new Map(statsList.map(s => [s.googlePlaceId, s]));

    finalRecommendations.forEach(rec => {
        if (rec.placeDetails && rec.placeDetails.place_id) {
            const stats = statsMap.get(rec.placeDetails.place_id);
            rec.placeDetails.planLi = {
                rating: stats ? stats.averageRating : 0,
                reviewCount: stats ? stats.reviewCount : 0
            };
        }
    });

    console.log(
      `✅ Returning ${finalRecommendations.length} merged recommendations (${cachedRecommendations.length} from cache, ${
        finalRecommendations.length - cachedRecommendations.length
      } from Google).`
    );

    return finalRecommendations;
  } catch (error) {
    console.error('❌ Error in AI Agent:', error);
    return [];
  }
};

// --- Helper Functions ---

function extractCuisineKeywords(prefs: string): string[] {
  const p = prefs.toLowerCase();
  const keywords: string[] = [];

  const cuisineTypes = [
    'sushi',
    'asian',
    'japanese',
    'chinese',
    'thai',
    'vietnamese',
    'italian',
    'pizza',
    'pasta',
    'burger',
    'hamburger',
    'american',
    'mexican',
    'tacos',
    'vegan',
    'vegetarian',
    'meat',
    'steak',
    'coffee',
    'cafe',
    'indian'
  ];

  cuisineTypes.forEach((type) => {
    if (p.includes(type)) keywords.push(type);
  });

  if (keywords.includes('sushi')) keywords.push('japanese');
  if (keywords.includes('japanese')) keywords.push('sushi');

  if (keywords.includes('burger')) keywords.push('hamburger');

  if (keywords.includes('pasta')) keywords.push('italian');
  if (keywords.includes('pizza')) keywords.push('italian');

  return keywords;
}

function matchesCuisine(place: any, cuisineKeywords: string[]): boolean {
  const placeText = `${place.name} ${place.types} ${
    place.richDescription ?? ''
  } ${place.vicinity ?? ''}`.toLowerCase();

  const tokens = placeText.split(/[^a-zA-Z]+/).filter(Boolean); 

  return cuisineKeywords.some((kw) => tokens.includes(kw));
}

function mapTypesToCategory(types: string): 'Food' | 'Drink' | 'Activity' | 'Nature' | 'Culture' {
  const t = types.toLowerCase();

  if (
    t.includes('movie_theater') ||
    t.includes('cinema') ||
    t.includes('museum') ||
    t.includes('art_gallery')
  )
    return 'Culture';
  if (
    t.includes('park') ||
    t.includes('camp') ||
    t.includes('natural') ||
    t.includes('tourist_attraction')
  )
    return 'Nature';
  if (
    t.includes('bar') ||
    t.includes('night_club') ||
    t.includes('pub') ||
    t.includes('wine')
  )
    return 'Drink';
  if (
    t.includes('restaurant') ||
    t.includes('food') ||
    t.includes('bakery') ||
    t.includes('cafe') ||
    t.includes('meal_takeaway')
  )
    return 'Food';

  return 'Activity';
}

function determineTimeOfDay(types: string[]): 'Day' | 'Night' | 'Any' {
  const t = types.join(' ').toLowerCase();
  if (t.includes('bar') || t.includes('night_club') || t.includes('pub'))
    return 'Night';
  if (t.includes('park') || t.includes('cafe') || t.includes('bakery'))
    return 'Day';
  return 'Any';
}

function calculateDynamicScore(rating?: number): number {
  if (!rating) return 85;
  return Math.min(99, Math.round(rating * 10 + 45 + Math.random() * 5));
}

async function generateGoogleQuery(preferences: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a query optimizer for Google Maps Places API.
                INPUT: User preferences string.
                OUTPUT: A clean, effective search query string.
                
                RULES:
                1. Combine "Vibe" and "Cuisine" smartly. Use OR for multiple cuisines.
                2. If vibe is "Coffee Cart", search for "Coffee cart" or "Food truck".
                3. If vibe/activity is "Movie", search for "Cinema" or "Movie Theater".
                4. Keep it short (max 6 words).
                5. If input mentions specific cuisine (Sushi), MUST include it.
                
                Examples:
                In: "Vibe: Coffee Cart." -> Out: "Coffee Cart or Food Truck"
                In: "Vibe: Fun. Cuisine: Movie." -> Out: "Cinema or Movie Theater"
                In: "Vibe: Romantic. Cuisine: Italian." -> Out: "Romantic Italian Restaurant"
                `
      },
      { role: 'user', content: preferences }
    ]
  });
  return response.choices[0].message.content || 'Date spots';
}

async function generateRichDescription(
  place: GooglePlace,
  userPrefs: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          "You are a copywriter for a dating app. Write a 1-sentence catchy description. If it's a Coffee Cart, mention it's great for a casual outdoor date. If it's a Cinema, mention the viewing experience."
      },
      {
        role: 'user',
        content: `Venue: ${place.name} (${place.types.join(
          ', '
        )}). User Vibe: ${userPrefs}. Write a description.`
      }
    ]
  });
  return (
    response.choices[0].message.content ||
    `${place.name} is a great spot matching your vibe.`
  );
}
