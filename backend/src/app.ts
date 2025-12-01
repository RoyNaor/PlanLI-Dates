import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from './middleware/auth.middleware';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Support both standard MONGODB_URI and user provided MONGOURI
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGOURI || '';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('PlanLI Dates Backend is running!');
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Protected Route Example
// We cast req to AuthRequest inside to avoid Express type mismatch
app.get('/api/protected', authenticate, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json({ message: 'You are authenticated!', uid: authReq.user?.uid });
});

// Connect to MongoDB and Start Server
const startServer = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
        console.warn('MONGODB_URI (or MONGOURI) is not defined in .env');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
