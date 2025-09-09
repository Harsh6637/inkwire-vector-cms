import React, { ReactNode } from 'react';
import { Resource } from '../types/resource';
interface ResourceContextType {
    resources: Resource[];
    setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
    addResource: (resource: Resource) => void;
    removeResource: (id: string) => void;
}
export declare const ResourceContext: React.Context<ResourceContextType>;
interface ResourceProviderProps {
    children: ReactNode;
}
export declare function ResourceProvider({ children }: ResourceProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ResourceContext.d.ts.map