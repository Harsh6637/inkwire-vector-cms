import { fetchWithAuth } from './authUtils';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const processingApi = {
  // Trigger processing for a specific resource
  processResource: async (resourceId: string) => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/processing/process/${resourceId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to process resource');
    }

    return data;
  },

  // Process all pending resources
  processAllPending: async () => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/processing/process-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to process resources');
    }

    return data;
  },

  // Get processing status
  getStatus: async (resourceId: string) => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/processing/status/${resourceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get status');
    }

    return data;
  }
};