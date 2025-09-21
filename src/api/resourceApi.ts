import { fetchWithAuth } from './authUtils';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { Resource } from '../types/resource';

export interface CreateResourceRequest {
name: string;
metadata: {
originalFileName: string;
fileType: string;
fileSize: number;
tags: string[]; // Tags stay in metadata
uploadDate: string;
rawData?: string;
};
text: string;
publishers: string[]; // Publishers sent as separate field
description: string; // Description sent as separate field
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
    formData.append('metadata', JSON.stringify(resourceData.metadata)); // Tags in metadata
    formData.append('text', resourceData.text);
    formData.append('publishers', JSON.stringify(resourceData.publishers)); // Dedicated field
    formData.append('description', resourceData.description); // Dedicated field

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

  // GET SINGLE RESOURCE API
  getById: async (id: string): Promise<Resource> => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/resources/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resource');
    }

    return data;
  },

  // ADVANCED SEARCH API - utilizes hybrid approach
  search: async (searchParams: {
    query?: string;
    publishers?: string[];
    tags?: string[];
    description?: string;
  }): Promise<Resource[]> => {
    const token = localStorage.getItem('inkwire_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();

    if (searchParams.query) queryParams.append('query', searchParams.query);
    if (searchParams.description) queryParams.append('description', searchParams.description);
    if (searchParams.publishers) {
      searchParams.publishers.forEach(p => queryParams.append('publishers', p));
    }
    if (searchParams.tags) {
      searchParams.tags.forEach(t => queryParams.append('tags', t));
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/resources/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search resources');
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
  // Trigger background chunk processing for a resource
  processChunks: async (resourceId: string): Promise<{ message: string }> => {
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
      throw new Error(data.message || 'Failed to process resource chunks');
    }

    return data;
  },
};