import { auth } from '../config/firebase';

// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost.
// If testing on physical device, use your machine's LAN IP.
const BASE_URL = 'http://172.20.10.2:3000/api';

class ApiServiceClass {
    private async getHeaders() {
        const user = auth.currentUser;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (user) {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorMessage = 'API request failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.warn('Non-JSON error response from API');
            }
            console.error(`API Error: ${response.status} ${errorMessage}`);
            throw new Error(errorMessage);
        }
        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        const headers = await this.getHeaders();
        console.log(`GET ${BASE_URL}${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const headers = await this.getHeaders();
        console.log(`POST ${BASE_URL}${endpoint}`, data);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return this.handleResponse<T>(response);
    }
}

export const ApiService = new ApiServiceClass();
