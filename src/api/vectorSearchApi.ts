import { fetchWithAuth } from './authUtils';

// Types for vector search API responses
export interface VectorSearchChunk {
id: number;
text: string;
score: number;
}

export interface VectorSearchDocument {
resource_id: number;
resource_title: string;
resource_type: string;
resource_created_at: string;
max_score: number;
chunk_count: number;
chunks: VectorSearchChunk[];
}

export interface VectorSearchResponse {
status: string;
query: string;
documents: VectorSearchDocument[];
total_chunks: number;
total_documents: number;
}

export interface DocumentContentResponse {
status: string;
document: {
id: number;
title: string;
type: string;
content: string;
created_at: string;
};
chunks: Array<{
id: number;
text: string;
}>;
full_text: string;
}

class VectorSearchApiService {
private baseUrl: string;

constructor() {
        // Use Vite environment variables
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('inkwire_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Search across all documents using vector similarity
     * Requires authentication
     */
    async searchDocuments(query: string): Promise<VectorSearchResponse> {
        if (!query.trim()) {
            throw new Error('Search query cannot be empty');
        }

        const url = `${this.baseUrl}/search/grouped`;
        const payload = { query: query.trim() };

        console.log('🚀 Making API call to:', url);

        try {
            const response = await fetchWithAuth(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);

                if (response.status === 403) {
                    throw new Error('Access denied. You do not have permission to search documents.');
                }
                if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }
                throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data: VectorSearchResponse = await response.json();
            console.log('✅ Raw API Response Data:', data);

            if (data.status !== 'success') {
                throw new Error(data.status || 'Search failed');
            }

            return data;
        } catch (error) {
            console.error('🔥 Fetch error:', error);
            throw error;
        }
    }

    /**
     * Search within a specific resource/document
     * Requires authentication
     */
    async searchInDocument(resourceId: number, query: string): Promise<any> {
        if (!query.trim()) {
            throw new Error('Search query cannot be empty');
        }

        const response = await fetchWithAuth(`${this.baseUrl}/search/resource/${resourceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query.trim() })
        });

        if (!response.ok) {
            throw new Error(`Document search failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.status || 'Document search failed');
        }

        return data;
    }

    /**
     * Test API connection
     * Public endpoint - no authentication required
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return response.ok;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('inkwire_token');
    }

    /**
     * Get current auth token
     */
    getToken(): string | null {
        return localStorage.getItem('inkwire_token');
    }

    /**
     * Clear authentication
     */
    clearAuth(): void {
        localStorage.removeItem('inkwire_token');
        localStorage.removeItem('inkwire_user');
    }
}

// Create and export a singleton instance
export const vectorSearchApi = new VectorSearchApiService();

// Export utility functions
export const formatSimilarityScore = (score: number): string => {
    // Corrected to handle null and undefined, and also fix precision.
    if (score == null || isNaN(score)) {
        return '0%';
    }
    const percentage = Math.round(score * 100);
    return `${percentage}%`;
};

export const truncateText = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};