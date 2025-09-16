import { fetchWithAuth } from './authUtils';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { Resource } from '../types/resource';

export interface CreateResourceRequest {
name: string;
metadata: any;
text: string;
}

export interface CreateResourceResponse {
message: string;
resourceId: string;
}

export const resourceApi = {
    // POST RESOURCE API
    create: async (resourceData: CreateResourceRequest): Promise<CreateResourceResponse> => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('name', resourceData.name);
    formData.append('metadata', JSON.stringify(resourceData.metadata));
    formData.append('text', resourceData.text);

    const response = await fetchWithAuth(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create resource');
    }

    return data;
  },

  // GET RESOURCES API
  getAll: async (): Promise<Resource[]> => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resources');
    }

    return data;
  },

  // DELETE RESOURCE API
  delete: async (id: string): Promise<{ message: string }> => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete resource');
    }

    return data;
  },
};