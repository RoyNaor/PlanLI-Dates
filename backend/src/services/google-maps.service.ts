import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface GooglePlace {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    types: string[];
    rating?: number;
    user_ratings_total?: number;
    photos?: { photo_reference: string }[];
    reviews?: {
        author_name: string;
        rating: number;
        text: string;
        time: number;
    }[];
}

export const getGooglePlaceDetails = async (placeId: string): Promise<GooglePlace | null> => {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("❌ Missing GOOGLE_MAPS_API_KEY");
        return null;
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                key: GOOGLE_MAPS_API_KEY,
                // fields: 'place_id,name,formatted_address,geometry,rating,user_ratings_total,types,photos,reviews'
            }
        });

        if (response.data.status !== 'OK') {
            console.error(`Google Places Details API Error: ${response.data.status}`);
            return null;
        }

        return response.data.result as GooglePlace;

    } catch (error) {
        console.error("Error fetching place details from Google Maps:", error);
        return null;
    }
};

/**
 * פונה לגוגל ומחזיר רשימה של מקומות רלוונטיים
 */
export const searchGooglePlaces = async (
    query: string, 
    location: { lat: number, lng: number }, 
    radius: number
): Promise<GooglePlace[]> => {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("❌ Missing GOOGLE_MAPS_API_KEY");
        return [];
    }

    try {
        console.log(`🌍 Calling Google Maps API for: "${query}"...`);
        
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
                query: query,
                location: `${location.lat},${location.lng}`,
                radius: radius,
                key: GOOGLE_MAPS_API_KEY,
            }
        });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error(`Google API Error: ${response.data.status}`);
            return [];
        }

        const results = response.data.results as GooglePlace[];
        
        // סינון ראשוני: מעיפים דברים שלא קשורים לבילוי
        // רשימה שחורה מורחבת - כל סוג עסק שלא מתאים לדייט
        const unwantedTypes = [
            'hospital', 'doctor', 'dentist', 'physiotherapist', 'pharmacy', 'veterinary_care', 
            'police', 'fire_station', 'funeral_home', 'cemetery',

            'gas_station', 'car_repair', 'car_wash', 'car_dealer', 'parking', 'car_rental',

            'atm', 'bank', 'accounting', 'insurance_agency', 'lawyer', 'real_estate_agency', 
            'post_office', 'local_government_office', 'embassy',

            'grocery_or_supermarket', 'supermarket', 'convenience_store', 
            'liquor_store', 
            'home_goods_store', 'furniture_store', 'hardware_store', 
            'clothing_store', 'shoe_store', 'electronics_store', 
            'pet_store', 'office_equipment_store','Deli',

            'travel_agency', 'tourist_attraction', 'lodging', 'airport', 'bus_station', 
            'subway_station', 'train_station', 'taxi_stand',
            
          
            'meal_delivery', 'meal_takeaway',

            'gym', 'hair_care', 'laundry', 'moving_company', 'storage',

            'school', 'primary_school', 'secondary_school', 'university'
        ];

        // ובתוך הפונקציה searchGooglePlaces:
        const filtered = results.filter(p => !p.types?.some(t => unwantedTypes.includes(t)));

        console.log(`✅ Google returned ${filtered.length} places (after filtering).`);
        return filtered;

    } catch (error) {
        console.error("Error fetching from Google Maps:", error);
        return [];
    }
};