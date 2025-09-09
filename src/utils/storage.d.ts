export interface Resource {
    id: string;
    name: string;
    type: string;
    size: number;
    content?: string;
    uploadDate: string;
    lastModified: string;
}
export declare function getResourcesFromSession(): Resource[];
export declare function saveResourcesToSession(resources: Resource[]): void;
//# sourceMappingURL=storage.d.ts.map