const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginRequest {
email: string;
password: string;
}

export interface LoginResponse {
token: string;
}

export const authApi = {
  // LOGIN API
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },
};