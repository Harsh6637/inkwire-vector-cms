// Types for resources stored in session
export interface Resource {
    id: string;
name: string;
type: string;
size: number;
content?: string;
uploadDate: string;
lastModified: string;
}

const KEY = 'inkwire_resources';

export function getResourcesFromSession(): Resource[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveResourcesToSession(resources: Resource[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(resources));
  } catch (e) {
    // ignore storage errors
  }
}