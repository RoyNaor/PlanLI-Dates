import { Request, Response } from 'express';
import { calculateMidpoint, calculateDistanceKm, Coordinates } from '../utils/geo.utils';
import { generateDateIdeas } from '../services/ai.service';
import { getPlaceDetails } from '../services/places.service';

export const calculateDateLogic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { l1, l2, preferences, strategy = 'MIDPOINT' } = req.body as {
      l1: Coordinates;
      l2: Coordinates;
      preferences?: string;
      strategy?: 'MIDPOINT' | 'NEAR_ME' | 'NEAR_THEM';
    };

    if (!l1 || !l2 || typeof l1.lat !== 'number' || typeof l1.lng !== 'number' || typeof l2.lat !== 'number' || typeof l2.lng !== 'number') {
      res.status(400).json({ success: false, message: 'Invalid coordinates provided. l1 and l2 must be {lat, lng}.' });
      return;
    }

    // Basic Calculations
    const midPoint = calculateMidpoint(l1, l2);
    const distanceKm = calculateDistanceKm(l1, l2);

    let searchCenter: Coordinates;
    let searchRadiusMeters: number;

    // Strategy Logic
    if (strategy === 'NEAR_ME') {
      searchCenter = l1;
      searchRadiusMeters = 2000;
    } else if (strategy === 'NEAR_THEM') {
      searchCenter = l2;
      searchRadiusMeters = 2000;
    } else {
      // MIDPOINT (Default)
      searchCenter = midPoint;
      // 15% of distance or minimum 1000m
      searchRadiusMeters = Math.max(1000, (distanceKm * 1000) * 0.15);
    }

    // Round radius
    searchRadiusMeters = Math.round(searchRadiusMeters);

    const aiSuggestions = await generateDateIdeas(searchCenter, preferences || '', strategy, searchRadiusMeters);

    // Enrichment Loop
    const enrichedResults = [];
    for (const suggestion of aiSuggestions) {
        const placeDetails = await getPlaceDetails(suggestion.search_query, searchCenter);
        if (placeDetails) {
            enrichedResults.push({
                ...suggestion,
                placeDetails
            });
        } else {
            console.log(`Skipping venue ${suggestion.name} - No Google Details found.`);
        }
    }

    res.status(200).json({
      success: true,
      data: {
        l1,
        l2,
        lmid: midPoint, // Always return midpoint even if not used as center
        distanceKm,
        strategy,
        searchCenter,
        searchRadiusMeters,
        aiSuggestions: enrichedResults
      }
    });
  } catch (error) {
    console.error('Error in calculateDateLogic:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
