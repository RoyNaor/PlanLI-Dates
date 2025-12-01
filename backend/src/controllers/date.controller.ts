import { Request, Response } from 'express';
import { calculateMidpoint, calculateDistanceKm, Coordinates } from '../utils/geo.utils';

export const calculateDateLogic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { l1, l2 } = req.body as { l1: Coordinates; l2: Coordinates };

    if (!l1 || !l2 || typeof l1.lat !== 'number' || typeof l1.lng !== 'number' || typeof l2.lat !== 'number' || typeof l2.lng !== 'number') {
      res.status(400).json({ success: false, message: 'Invalid coordinates provided. l1 and l2 must be {lat, lng}.' });
      return;
    }

    const midPoint = calculateMidpoint(l1, l2);
    const distanceKm = calculateDistanceKm(l1, l2);

    // Recommended Search Radius: 15% of distance or minimum 1000m
    const searchRadiusMeters = Math.max(1000, (distanceKm * 1000) * 0.15);

    res.status(200).json({
      success: true,
      data: {
        l1,
        l2,
        lmid: midPoint,
        distanceKm,
        searchRadiusMeters: Math.round(searchRadiusMeters)
      }
    });
  } catch (error) {
    console.error('Error in calculateDateLogic:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
