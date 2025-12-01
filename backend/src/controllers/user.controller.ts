import { Request, Response } from 'express';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';

export const registerUser = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { uid, email } = authReq.user;
  const { name } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ uid });
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    user = new User({
      uid,
      email: email || '', // Firebase email might be undefined if not email auth, but we enforce it in schema
      name: name || '',
      savedLocations: []
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
