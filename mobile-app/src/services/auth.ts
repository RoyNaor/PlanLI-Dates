import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthService = {
  signUp: async (email: string, pass: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  },

  signIn: async (email: string, pass: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser;
  }
};
