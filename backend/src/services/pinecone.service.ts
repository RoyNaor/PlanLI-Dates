import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from './embedding.service';
import { calculateDistanceKm } from '../utils/geo.utils'; 
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is missing in .env");
}

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("date-ideas"); 

export interface PlaceMetadata {
    name: string;
    place_id: string; 
    types: string;
    rating: number;
    user_ratings_total?: number;
    vicinity?: string; 
    lat: number;
    lng: number;
    richDescription: string; 
    photo_references?: string[]; 
}

export const searchSimilarPlaces = async (
    queryText: string, 
    center: { lat: number, lng: number }, 
    radiusMeter: number
): Promise<(PlaceMetadata & { matchScore: number })[]> => {
  console.log(`🧠 Pinecone: Searching for "${queryText}"...`);
  
  const vector = await getEmbedding(queryText);

  const queryResponse = await index.query({
    vector: vector,
    topK: 20, 
    includeMetadata: true,
  });

  const relevantPlaces = queryResponse.matches
    .filter((match: any) => {
        if (!match.metadata) return false;
        
        const placeLat = match.metadata.lat;
        const placeLng = match.metadata.lng;
        
        const distKm = calculateDistanceKm(center, { lat: placeLat, lng: placeLng });
        const distMeters = distKm * 1000;
        
        const effectiveRadius = Math.max(radiusMeter * 2, 3000); 
        
        return distMeters <= effectiveRadius;
    })
    .map(match => ({
        ...(match.metadata as unknown as PlaceMetadata),
        matchScore: (match.score || 0) * 100
    }));

  return relevantPlaces;
};


export const savePlaceToPinecone = async (place: any, aiDescription: string) => {
  try {
      const vector = await getEmbedding(aiDescription);
      
      const photoRefs = place.photos 
        ? place.photos.map((p: any) => p.photo_reference).slice(0, 5) 
        : [];

      const metadata: PlaceMetadata = {
          name: place.name,
          place_id: place.place_id,
          types: place.types ? place.types.join(', ') : '',
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          vicinity: place.vicinity || place.formatted_address || '',
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          richDescription: aiDescription,
          photo_references: photoRefs 
      };

      await index.upsert([
        {
          id: place.place_id, 
          values: vector,
          metadata: metadata as any
        }
      ]);
      
      console.log(`💾 Saved to Pinecone: ${place.name} with ${photoRefs.length} photos`);
  } catch (error) {
      console.error("Error saving to Pinecone:", error);
  }
};
