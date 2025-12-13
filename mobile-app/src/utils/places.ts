import { AiRecommendation } from '../components/VenueCard';

export const getPlaceId = (place: Partial<AiRecommendation>): string | undefined => {
  const details = place.placeDetails;
  return (
    details?.place_id || details?.googlePlaceId || place.place_id || place.googlePlaceId
  );
};

export interface SavedDateEntry {
  placeId: string;
  place: AiRecommendation;
  savedAt?: string;
}
