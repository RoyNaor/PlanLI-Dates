import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthService = {
  signUp: async (email: string, pass: string, fullName: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);

    await updateProfile(result.user, { displayName: fullName });
    await result.user.reload();

    return auth.currentUser || result.user;
  },

  signIn: async (email: string, pass: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await result.user.reload();
    return auth.currentUser || result.user;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser;
  }
};
