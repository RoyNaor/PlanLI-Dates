import { Request, Response } from 'express';
import { calculateMidpoint, calculateDistanceKm, Coordinates } from '../utils/geo.utils';
import { generateDateIdeas } from '../services/ai.service';

export const calculateDateLogic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { l1, l2, preferences, strategy = 'MIDPOINT', radius } = req.body as {
      l1: Coordinates;
      l2: Coordinates;
      preferences?: string;
      strategy?: 'MIDPOINT' | 'NEAR_ME' | 'NEAR_THEM';
      radius?: number; 
    };

    if (!l1 || typeof l1.lat !== 'number' || typeof l1.lng !== 'number') {
      res.status(400).json({ success: false, message: 'Invalid coordinates provided for User 1 (l1).' });
      return;
    }

    const safeL2 = l2 || l1; 
    const midPoint = calculateMidpoint(l1, safeL2);
    const distanceKm = calculateDistanceKm(l1, safeL2);

    let searchCenter: Coordinates;

    if (strategy === 'NEAR_ME') {
      searchCenter = l1;
    } else if (strategy === 'NEAR_THEM' && l2) {
      searchCenter = l2;
    } else {
      // MIDPOINT (Default)
      searchCenter = midPoint;
    }

    let searchRadiusMeters: number;
    if (radius && typeof radius === 'number') {
        searchRadiusMeters = radius;
    } else {
        if (strategy === 'NEAR_ME' || strategy === 'NEAR_THEM') {
            searchRadiusMeters = 2000; 
        } else {
            searchRadiusMeters = Math.max(1500, (distanceKm * 1000) * 0.15);
        }
    }
    searchRadiusMeters = Math.round(searchRadiusMeters);

    console.log(`🚀 Controller: Searching around [${searchCenter.lat}, ${searchCenter.lng}] with radius ${searchRadiusMeters}m`);

    const aiSuggestions = await generateDateIdeas(
        searchCenter, 
        preferences || '', 
        strategy, 
        searchRadiusMeters
    );

    res.status(200).json({
      success: true,
      data: {
        l1,
        l2: safeL2,
        lmid: midPoint,         
        distanceKm,
        strategy,
        focusPoint: searchCenter, 
        searchRadiusMeters,
        aiSuggestions: aiSuggestions 
      }
    });

  } catch (error) {
    console.error('❌ Error in calculateDateLogic:', error);
    res.status(500).json({ success: false, message: 'Server error processing date request' });
  }
};
