import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { JobRequestFull } from '@/types/job-request.type';
import axios from 'axios';

export function useStudentJobRequests(session: Session | null) {
  const [jobRequests, setJobRequests] = useState<JobRequestFull[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    const fetchJobRequests = async (userId: string) => {
      try {
        const response = await axios.get(`${apiUrl}/users/${userId}/job-requests`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        setJobRequests(response.data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching job requests:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchJobRequests(session.user.id);
    }
  }, [session, apiUrl]);

  return { jobRequests, setJobRequests, isLoading, error };
}
