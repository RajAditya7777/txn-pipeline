import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Job } from '../types/job';

export function useJobPolling(jobId: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const resumePolling = () => {
    setRetryTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    let isMounted = true;
    let timeoutId: number;

    const fetchStatus = async () => {
      try {
        const response = await api.get<Job>(`/jobs/${jobId}/status`);
        if (isMounted) {
          setJob(response.data);
          setError(null);
          
          const status = response.data.status?.toLowerCase();
          if (status === 'pending' || status === 'processing') {
            timeoutId = window.setTimeout(fetchStatus, 3000);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Failed to fetch job status');
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [jobId, retryTrigger]);

  return { job, error, resumePolling };
}
