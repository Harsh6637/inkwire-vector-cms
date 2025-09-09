import React, { createContext, useState, ReactNode } from 'react';
import { Resource } from '../types/resource';

interface ResourceContextType {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  addResource: (resource: Resource) => void;
  removeResource: (id: string) => void;
}

export const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

interface ResourceProviderProps {
  children: ReactNode;
}

export function ResourceProvider({ children }: ResourceProviderProps) {
  const [resources, setResources] = useState<Resource[]>(() => {
    const stored = sessionStorage.getItem('inkwire_resources');
    return stored ? JSON.parse(stored) : [];
  });

  const addResource = (resource: Resource) => {
    const newResources = [...resources, resource];
    setResources(newResources);
    sessionStorage.setItem('inkwire_resources', JSON.stringify(newResources));
  };

  const removeResource = (id: string) => {
    const newResources = resources.filter(r => r.id !== id);
    setResources(newResources);
    sessionStorage.setItem('inkwire_resources', JSON.stringify(newResources));
  };

  return (
    <ResourceContext.Provider value={{ resources, setResources, addResource, removeResource }}>
      {children}
    </ResourceContext.Provider>
  );
}