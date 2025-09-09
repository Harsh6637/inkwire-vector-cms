import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getResourcesFromSession, saveResourcesToSession } from '../utils/storage';

// Types
interface Resource {
id: string;
name: string;
type: string;
size: number;
content?: string;
uploadDate: string;
lastModified: string;
}

interface ResourceContextType {
resources: Resource[];
addResource: (resource: Resource) => void;
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  clearResources: () => void;
}

interface ResourceProviderProps {
  children: ReactNode;
}

export const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function ResourceProvider({ children }: ResourceProviderProps): JSX.Element {
  const [resources, setResources] = useState<Resource[]>(() => getResourcesFromSession());

  // Keep session storage in sync
  useEffect(() => {
    saveResourcesToSession(resources);
  }, [resources]);

  const addResource = (resource: Resource): void => {
    setResources((prev) => [...prev, resource]);
  };

  const clearResources = (): void => {
    setResources([]);
  };

  const contextValue: ResourceContextType = {
    resources,
    addResource,
    setResources,
    clearResources
  };

  return (
    <ResourceContext.Provider value={contextValue}>
      {children}
    </ResourceContext.Provider>
  );
}