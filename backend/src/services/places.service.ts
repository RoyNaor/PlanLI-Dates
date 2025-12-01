import axios from 'axios';
import { Coordinates } from '../utils/geo.utils';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: {
    photo_reference: string;
  }[];
  business_status?: string;
}

export const getPlaceDetails = async (query: string, location: Coordinates): Promise<GooglePlaceResult | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is missing");
    return null;
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: query,
        key: GOOGLE_MAPS_API_KEY,
        location: `${location.lat},${location.lng}`,
        radius: 1000 // Bias results to the area
      }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error(`Google Places API Error: ${response.data.status} - ${response.data.error_message}`);
        return null;
    }

    const results: GooglePlaceResult[] = response.data.results;

    if (!results || results.length === 0) {
      return null;
    }

    // Filter out closed places
    const openPlaces = results.filter(place =>
      place.business_status !== 'CLOSED_PERMANENTLY' && place.business_status !== 'TEMPORARILY_CLOSED'
    );

    if (openPlaces.length === 0) {
      return null;
    }

    // Return the top result
    return openPlaces[0];

  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
};
