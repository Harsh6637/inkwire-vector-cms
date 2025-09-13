import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Resource } from '../types/resource';
import { resourceApi } from '../api/resourceApi';

interface ResourceContextType {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  addResource: (resource: Resource) => void;
  removeResource: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  fetchResources: (force?: boolean) => Promise<void>;
  hasFetched: boolean;
}

export const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

interface ResourceProviderProps {
  children: ReactNode;
}

export function ResourceProvider({ children }: ResourceProviderProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch resources from database
  const fetchResources = async (force: boolean = false) => {
    if (isLoading || (hasFetched && !force)) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedResources = await resourceApi.getAll();
      setResources(fetchedResources);
      setHasFetched(true);
    } catch (err: any) {
      console.error('Failed to fetch resources:', err);
      setError(err.message || 'Failed to fetch resources');
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshResources = () => fetchResources(true);

  // Load resources when component mounts
  useEffect(() => {
    // Only fetch if user is authenticated
    const token = localStorage.getItem('inkwire_token');
    if (token) {
      fetchResources();
    }
  }, []);

  const addResource = (resource: Resource) => {
    setResources(prev => [...prev, resource]);
  };

  const removeResource = async (id: string) => {
    try {
      setError(null);
      // Call backend API to delete resource
      await resourceApi.delete(id);

      // Remove from local state on success
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error('Failed to remove resource:', err);
      setError(err.message || 'Failed to remove resource');
      throw err; // Re-throw so components can handle the error
    }
  };

  return (
    <ResourceContext.Provider value={{
      resources,
      setResources,
      addResource,
      removeResource,
      fetchResources,
      isLoading,
      error,
      hasFetched
    }}>
      {children}
    </ResourceContext.Provider>
  );
}