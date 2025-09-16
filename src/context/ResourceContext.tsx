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
  refreshResources: () => void;
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

  const refreshResources = () => {
    setHasFetched(false);
    fetchResources(true);
  };

  // Load resources when component mounts
  useEffect(() => {
    const token = localStorage.getItem('inkwire_token');
    if (token) {
      fetchResources();
    }
  }, []);

  const addResource = (resource: Resource) => {
    setResources(prev => [...prev, resource]);
    // Refresh to get the latest data from server
    refreshResources();
  };

  const removeResource = async (id: string) => {
    try {
      setError(null);
      // Call backend API to delete resource
      await resourceApi.delete(id);

      // Refresh resources from server to ensure consistency
      await fetchResources(true);
    } catch (err: any) {
      console.error('Failed to remove resource:', err);
      setError(err.message || 'Failed to remove resource');
      throw err;
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
      hasFetched,
      refreshResources
    }}>
      {children}
    </ResourceContext.Provider>
  );
}