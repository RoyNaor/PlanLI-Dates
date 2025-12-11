import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import PlaceStats from '../models/PlaceStats';
import Place from '../models/place.model';
import { getGooglePlaceDetails } from '../services/google-maps.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    const { googlePlaceId, rating, content } = req.body;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: No user found on request' });
      return;
    }

    if (!googlePlaceId || !rating || !content) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const review = new Review({
      googlePlaceId,
      userId: user.uid,
      authorName: user.name || user.email || 'Anonymous',
      rating,
      content
    });

    await review.save();

    // Update PlaceStats atomically
    const updatedStats = await PlaceStats.findOneAndUpdate(
        { googlePlaceId },
        {
            $inc: { reviewCount: 1, totalRating: rating },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Calculate average rating
    if (updatedStats) {
        updatedStats.averageRating = updatedStats.totalRating / updatedStats.reviewCount;
        await updatedStats.save();
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: No user found on request' });
      return;
    }

    if (!content) {
      res.status(400).json({ message: 'Reply content is required' });
      return;
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      userId: user.uid,
      authorName: user.name || user.email || 'Anonymous',
      content,
      createdAt: new Date(),
      likes: []
    };

    review.replies.push(reply as any);
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    const { reviewId } = req.params;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: No user found on request' });
      return;
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    const hasLiked = review.likes.includes(user.uid);

    if (hasLiked) {
      review.likes = review.likes.filter((id) => id !== user.uid);
    } else {
      review.likes.push(user.uid);
    }

    await review.save();

    res.json({
      likesCount: review.likes.length,
      liked: !hasLiked,
      review
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPlaceDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { googlePlaceId } = req.params;

    if (!googlePlaceId) {
      res.status(400).json({ message: 'Missing googlePlaceId' });
      return;
    }

    // 1. Fetch Google Data from Place model (if exists, else fetch from Google API and cache it)
    let place = await Place.findOne({ googlePlaceId });

    if (!place) {
      // Fetch from Google API
      // Since fetchGooglePlaceDetails takes query and location, and here we might only have ID.
      // But looking at existing Place model, it is cached.
      // If it's not in our cache, we usually use the ID to get details from Google Places Details API.
      // However, the `places.service.ts` uses `textsearch` which returns a list.
      // We need a way to get details by ID or just accept we might not have it if not cached.
      // BUT, the requirements say "Fetch Google Data from Place model (if exists, else fetch from Google API and cache it)".
      // The provided `places.service.ts` only has `getPlaceDetails` which takes query and location.
      // It seems I might need to implement a fetch by ID or assume the ID is enough to use text search? No, ID is specific.
      // Let's check `google-maps.service.ts` maybe it has it.

      // Wait, the task says "Fetch Google Data from Place model (if exists, else fetch from Google API and cache it)".
      // If I don't have a way to fetch by ID in the current codebase, I should implement it or look for it.
      // Let's assume for now I can't easily fetch by ID if not implemented, I'll check `google-maps.service.ts` first.
    }

    // 2. Fetch PlanLi Reviews
    const reviews = await Review.find({ googlePlaceId }).sort({ createdAt: -1 });

    // 3. Fetch Stats
    const stats = await PlaceStats.findOne({ googlePlaceId });

    const planLiData = {
      rating: stats ? stats.averageRating : 0,
      reviewCount: stats ? stats.reviewCount : 0,
      reviews: reviews
    };

    // If place is found in DB
    if (place) {
      res.json({
        ...place.toObject(),
        planLi: planLiData
      });
      return;
    }

    // If not in DB, we try to fetch from Google
    const googlePlace = await getGooglePlaceDetails(googlePlaceId);

    if (googlePlace) {
        // Cache it!
        const newPlace = new Place({
            googlePlaceId: googlePlace.place_id,
            name: googlePlace.name,
            location: googlePlace.geometry.location,
            address: googlePlace.formatted_address,
            rating: googlePlace.rating,
            userRatingsTotal: googlePlace.user_ratings_total,
            types: googlePlace.types,
            photos: googlePlace.photos ? googlePlace.photos.map(p => ({
                photo_reference: p.photo_reference,
                height: 0,
                width: 0,
                html_attributions: []
            })) : [],
            reviews: googlePlace.reviews ? googlePlace.reviews.map(r => ({
                author_name: r.author_name,
                rating: r.rating,
                text: r.text,
                time: r.time
            })) : []
        });

        await newPlace.save();

        res.json({
            ...newPlace.toObject(),
            planLi: planLiData
        });
        return;
    }

    // If not found in Google either
    res.status(404).json({
        message: "Place not found in PlanLi Cache or Google Maps",
        planLi: planLiData
    });

  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
