import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProtectedData = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json({ message: 'You are authenticated!', uid: authReq.user?.uid });
};
