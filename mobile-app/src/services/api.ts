import { auth } from '../config/firebase';

// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost.
// If testing on physical device, use your machine's LAN IP.
const BASE_URL = 'http://10.100.102.6:3000/api';

export const ApiService = {
  post: async (endpoint: string, data: any) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // response was not json
        }
        throw new Error(errorMessage);
    }

    return response.json();
  }
};
