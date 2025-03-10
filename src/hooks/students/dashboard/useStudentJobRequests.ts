import axios from 'axios';
import { Session } from 'next-auth';

import { useCallback, useEffect, useState } from 'react';

import { JobRequestFull } from '@/types/request_status.type';

export function useStudentJobRequests(session: Session | null) {
  const [requests, setRequests] = useState<JobRequestFull[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get('/api/student/job-requests');
      setRequests(response.data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching job requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const deleteRequest = useCallback(async (requestId: string) => {
    try {
      await axios.delete(`/api/student/job-requests/${requestId}`);
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      return true;
    } catch (error) {
      console.error('Error deleting job request:', error);
      return false;
    }
  }, []);

  return {
    requests,
    setRequests,
    isLoading,
    error,
    deleteRequest,
    refreshRequests: fetchRequests,
  };
}
