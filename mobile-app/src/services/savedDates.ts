import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiRecommendation } from '../components/VenueCard';
import { getPlaceId, SavedDateEntry } from '../utils/places';

const STORAGE_KEY = 'pld-saved-dates';

const readSavedDates = async (): Promise<SavedDateEntry[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedDateEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse saved dates', error);
    return [];
  }
};

const writeSavedDates = async (dates: SavedDateEntry[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
};

export const SavedDatesService = {
  async getSavedDates(): Promise<SavedDateEntry[]> {
    return readSavedDates();
  },

  async isDateSaved(placeId: string): Promise<boolean> {
    const savedDates = await readSavedDates();
    return savedDates.some((entry) => entry.placeId === placeId);
  },

  async saveDate({ placeId, place }: { placeId: string; place: AiRecommendation }): Promise<SavedDateEntry[]> {
    const existing = await readSavedDates();
    const alreadySaved = existing.some((entry) => entry.placeId === placeId);

    if (alreadySaved) {
      return existing;
    }

    const savedAt = new Date().toISOString();
    const placeDetails = {
      ...place,
      placeDetails: place.placeDetails || place,
    } as AiRecommendation;

    const updated: SavedDateEntry[] = [
      { placeId, place: placeDetails, savedAt },
      ...existing,
    ];

    await writeSavedDates(updated);
    return updated;
  },

  async removeDate(placeId: string): Promise<SavedDateEntry[]> {
    const existing = await readSavedDates();
    const filtered = existing.filter((entry) => entry.placeId !== placeId);
    await writeSavedDates(filtered);
    return filtered;
  },
};

export const resolvePlaceId = (place: AiRecommendation): string | undefined => getPlaceId(place);
