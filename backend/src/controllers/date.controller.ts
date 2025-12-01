import { Request, Response } from 'express';
import { calculateMidpoint, calculateDistanceKm, Coordinates } from '../utils/geo.utils';
import { generateDateIdeas } from '../services/ai.service';
import { getPlaceDetails } from '../services/places.service';

export const calculateDateLogic = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. הוספנו את radius כאופציונלי
    const { l1, l2, preferences, strategy = 'MIDPOINT', radius } = req.body as {
      l1: Coordinates;
      l2: Coordinates;
      preferences?: string;
      strategy?: 'MIDPOINT' | 'NEAR_ME' | 'NEAR_THEM';
      radius?: number; 
    };

    // ולידציה בסיסית
    if (!l1 || !l2 || typeof l1.lat !== 'number' || typeof l1.lng !== 'number' || typeof l2.lat !== 'number' || typeof l2.lng !== 'number') {
      res.status(400).json({ success: false, message: 'Invalid coordinates provided. l1 and l2 must be {lat, lng}.' });
      return;
    }

    // חישובים בסיסיים (אמצע ומרחק)
    const midPoint = calculateMidpoint(l1, l2);
    const distanceKm = calculateDistanceKm(l1, l2);

    let searchCenter: Coordinates;
    let searchRadiusMeters: number;

    // 2. קביעת מרכז החיפוש לפי האסטרטגיה
    if (strategy === 'NEAR_ME') {
      searchCenter = l1;
    } else if (strategy === 'NEAR_THEM') {
      searchCenter = l2;
    } else {
      // MIDPOINT (Default)
      searchCenter = midPoint;
    }

    // 3. לוגיקה לרדיוס: אם קיבלנו מהסליידר - משתמשים בו. אם לא - חישוב אוטומטי.
    if (radius && typeof radius === 'number') {
        searchRadiusMeters = radius;
    } else {
        // Fallback Logic (הלוגיקה הישנה)
        if (strategy === 'NEAR_ME' || strategy === 'NEAR_THEM') {
            searchRadiusMeters = 2000;
        } else {
            // 15% מהמרחק או מינימום 1 ק"מ
            searchRadiusMeters = Math.max(1000, (distanceKm * 1000) * 0.15);
        }
    }

    // עיגול הרדיוס למספר שלם
    searchRadiusMeters = Math.round(searchRadiusMeters);

    // קריאה ל-AI
    const aiSuggestions = await generateDateIdeas(searchCenter, preferences || '', strategy, searchRadiusMeters);

    // Enrichment Loop - השלמת פרטים מגוגל
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
        lmid: midPoint, // תמיד מחזירים את האמצע האמיתי (בשביל המפה)
        distanceKm,
        strategy,
        searchCenter,   // המרכז שבו באמת חיפשנו
        searchRadiusMeters,
        aiSuggestions: enrichedResults
      }
    });
  } catch (error) {
    console.error('Error in calculateDateLogic:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};