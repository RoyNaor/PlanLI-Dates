import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiRecommendation } from '../components/VenueCard';
import { getPlaceId, SavedDateEntry, SavedPlaylist } from '../utils/places';

const STORAGE_KEY = 'pld-saved-dates';
const DEFAULT_PLAYLIST: SavedPlaylist = {
  id: 'save-for-later',
  name: 'שמור לאחר כך',
  createdAt: new Date().toISOString()
};

interface SavedDatesState {
  entries: SavedDateEntry[];
  playlists: SavedPlaylist[];
}

const readSavedDatesState = async (): Promise<SavedDatesState> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { entries: [], playlists: [DEFAULT_PLAYLIST] };

  try {
    const parsed = JSON.parse(raw) as SavedDatesState | SavedDateEntry[];

    if (Array.isArray(parsed)) {
      return { entries: parsed, playlists: [DEFAULT_PLAYLIST] };
    }

    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    const playlists = Array.isArray(parsed.playlists) && parsed.playlists.length > 0
      ? parsed.playlists
      : [DEFAULT_PLAYLIST];

    return { entries, playlists };
  } catch (error) {
    console.warn('Failed to parse saved dates', error);
    return { entries: [], playlists: [DEFAULT_PLAYLIST] };
  }
};

const writeSavedDates = async (state: SavedDatesState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const SavedDatesService = {
  async getState(): Promise<SavedDatesState> {
    return readSavedDatesState();
  },

  async getSavedDates(playlistId?: string): Promise<SavedDateEntry[]> {
    const state = await readSavedDatesState();
    if (!playlistId) return state.entries;

    return state.entries.filter((entry) => entry.playlistId === playlistId);
  },

  async getPlaylists(): Promise<SavedPlaylist[]> {
    const state = await readSavedDatesState();
    return state.playlists;
  },

  async isDateSaved(placeId: string): Promise<boolean> {
    const savedDates = await readSavedDatesState();
    return savedDates.entries.some((entry) => entry.placeId === placeId);
  },

  async addPlaylist(name: string): Promise<SavedPlaylist[]> {
    const trimmed = name.trim();
    if (!trimmed) {
      return (await readSavedDatesState()).playlists;
    }

    const state = await readSavedDatesState();
    const newPlaylist: SavedPlaylist = {
      id: `pl-${Date.now()}`,
      name: trimmed,
      createdAt: new Date().toISOString()
    };

    const updatedState: SavedDatesState = {
      ...state,
      playlists: [...state.playlists, newPlaylist]
    };

    await writeSavedDates(updatedState);
    return updatedState.playlists;
  },

  async saveDate({
    placeId,
    place,
    playlistId
  }: {
    placeId: string;
    place: AiRecommendation;
    playlistId?: string;
  }): Promise<SavedDateEntry[]> {
    const state = await readSavedDatesState();
    const alreadySaved = state.entries.some((entry) => entry.placeId === placeId);

    if (alreadySaved) {
      return state.entries;
    }

    const savedAt = new Date().toISOString();
    const targetPlaylistId = playlistId || state.playlists[0].id;

    const playlistExists = state.playlists.some((playlist) => playlist.id === targetPlaylistId);
    const ensuredPlaylists = playlistExists
      ? state.playlists
      : [...state.playlists, { ...DEFAULT_PLAYLIST, id: targetPlaylistId }];

    const placeDetails = {
      ...place,
      placeDetails: place.placeDetails || place,
    } as AiRecommendation;

    const updatedState: SavedDatesState = {
      entries: [{ placeId, place: placeDetails, savedAt, playlistId: targetPlaylistId }, ...state.entries],
      playlists: ensuredPlaylists
    };

    await writeSavedDates(updatedState);
    return updatedState.entries;
  },

  async removeDate(placeId: string): Promise<SavedDateEntry[]> {
    const state = await readSavedDatesState();
    const filtered = state.entries.filter((entry) => entry.placeId !== placeId);
    await writeSavedDates({ ...state, entries: filtered });
    return filtered;
  },
};

export const resolvePlaceId = (place: AiRecommendation): string | undefined => getPlaceId(place);
