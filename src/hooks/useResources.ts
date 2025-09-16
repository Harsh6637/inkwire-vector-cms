import { useState, useEffect, useCallback } from 'react';
import { resourceApi } from '../api/resourceApi';
import { Resource } from '../types/resource';

interface UseResourcesReturn {
resources: Resource[];
isLoading: boolean;
error: string | null;
fetchResources: () => Promise<void>;
  removeResource: (id: string) => Promise<void>;
  addResource: (resource: Resource) => void;
  refreshResources: () => Promise<void>;
  // Dialog states
  removeDialogOpen: boolean;
  resourceToRemove: Resource | null;
  openRemoveDialog: (resource: Resource) => void;
  closeRemoveDialog: () => void;
  confirmRemove: (onMessageUpdate?: (resourceId: string) => void) => Promise<void>;
}

// Global state - shared across all components
let globalResources: Resource[] = [];
let globalSetters: Set<(resources: Resource[]) => void> = new Set();
let globalDialogSetters: Set<(state: { open: boolean; resource: Resource | null }) => void> = new Set();

// Global dialog state
let globalDialogState = { open: false, resource: null as Resource | null };

const updateAllComponents = (newResources: Resource[]) => {
  globalResources = newResources;
  globalSetters.forEach(setter => setter([...newResources]));
};

const updateAllDialogs = (dialogState: { open: boolean; resource: Resource | null }) => {
  globalDialogState = dialogState;
  globalDialogSetters.forEach(setter => setter({ ...dialogState }));
};

export const useResources = (): UseResourcesReturn => {
  const [resources, setResources] = useState<Resource[]>(globalResources);
  const [dialogState, setDialogState] = useState(globalDialogState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register this component's setters
  useEffect(() => {
    globalSetters.add(setResources);
    globalDialogSetters.add(setDialogState);
    return () => {
      globalSetters.delete(setResources);
      globalDialogSetters.delete(setDialogState);
    };
  }, []);

  const fetchResources = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedResources = await resourceApi.getAll();
      updateAllComponents(fetchedResources);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources');
      console.error('Failed to fetch resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const removeResource = useCallback(async (id: string) => {
    try {
      setError(null);

      // Optimistic update - remove immediately from UI
      const optimisticResources = globalResources.filter(r => r.id !== id);
      updateAllComponents(optimisticResources);

      // Try to delete from server
      try {
        await resourceApi.delete(id);
      } catch (deleteError: any) {
        // If 404, resource already deleted - that's fine
        if (!deleteError.message?.includes('not found') && !deleteError.message?.includes('Resource not found')) {
          // Revert optimistic update on real error
          await fetchResources();
          throw deleteError;
        }
      }

      // Sync with server to ensure consistency
      await fetchResources();

    } catch (err: any) {
      setError(err.message || 'Failed to remove resource');
      console.error('Failed to remove resource:', err);
      // Revert to server state
      await fetchResources();
      throw err;
    }
  }, [fetchResources]);

  const addResource = useCallback((resource: Resource) => {
    const newResources = [...globalResources, resource];
    updateAllComponents(newResources);
    // Refresh from server to get the latest state
    fetchResources();
  }, [fetchResources]);

  const refreshResources = useCallback(async () => {
    await fetchResources();
  }, [fetchResources]);

  // Dialog management functions
  const openRemoveDialog = useCallback((resource: Resource) => {
    updateAllDialogs({ open: true, resource });
  }, []);

  const closeRemoveDialog = useCallback(() => {
    updateAllDialogs({ open: false, resource: null });
  }, []);

  const confirmRemove = useCallback(async (onMessageUpdate?: (resourceId: string) => void) => {
    if (!dialogState.resource) return;

    const resourceId = dialogState.resource.id;

    // Close dialog immediately for better UX
    closeRemoveDialog();

    // Call the message update callback BEFORE removing the resource
    if (onMessageUpdate) {
      onMessageUpdate(resourceId);
    }

    try {
      await removeResource(resourceId);
    } catch (error) {
      console.error('Failed to remove resource:', error);
    }
  }, [dialogState.resource, removeResource, closeRemoveDialog]);

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem('inkwire_token');
    if (token && globalResources.length === 0) {
      fetchResources();
    }
  }, [fetchResources]);

  return {
    resources,
    isLoading,
    error,
    fetchResources,
    removeResource,
    addResource,
    refreshResources,
    removeDialogOpen: dialogState.open,
    resourceToRemove: dialogState.resource,
    openRemoveDialog,
    closeRemoveDialog,
    confirmRemove
  };
};