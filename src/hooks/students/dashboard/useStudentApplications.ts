import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { JobApplicationFull } from '@/types/application_status.type';
import axios from 'axios';

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
        // Utilisation d'Axios au lieu de fetch
        const response = await axios.get(`${apiUrl}/users/${userId}/job-requests`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Équivalent à credentials: 'include'
        });

        // Avec Axios, les données sont déjà dans response.data (pas besoin de .json())
        setApplications(response.data);
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
