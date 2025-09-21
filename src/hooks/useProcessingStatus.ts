import { useState, useEffect } from 'react';
import { processingApi } from '../api/processingApi';

export const useProcessingStatus = (resourceId: string | null) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [chunkCount, setChunkCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceName, setResourceName] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;

    let interval: ReturnType<typeof setInterval>;

    const fetchStatus = async () => {
      try {
        const resp = await processingApi.getStatus(resourceId);
        setStatus(resp.status);
        setChunkCount(resp.chunkCount || 0);
        setReady(resp.ready);
        setResourceName(resp.resourceName);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Failed to fetch status');
        clearInterval(interval);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000); // poll every 3s

    return () => clearInterval(interval);
  }, [resourceId]);

  return { status, chunkCount, ready, error, resourceName };
};
