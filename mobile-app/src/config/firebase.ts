import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyCZtLkKvpUPOUgEE7SqrK1GpxL5QddpaiU",
  authDomain: "planli-dates-dev.firebaseapp.com",
  projectId: "planli-dates-dev",
  storageBucket: "planli-dates-dev.firebasestorage.app",
  messagingSenderId: "406568693824",
  appId: "1:406568693824:web:2260c9c6509cdf92b16fa5"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
