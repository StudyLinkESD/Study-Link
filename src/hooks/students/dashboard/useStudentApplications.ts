import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { JobApplicationFull } from '@/types/application_status.type';

export function useStudentApplications(session: Session | null) {
  const [applications, setApplications] = useState<JobApplicationFull[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    const fetchApplications = async (userId: string) => {
      try {
        // Updated URL to use the correct API route for the current user's job requests
        const response = await fetch(`${apiUrl}/users/${userId}/job-requests`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications(session.user.id);
  }, [session?.user?.email, apiUrl, session?.user.id]);

  return { applications, setApplications, isLoading, error };
}
