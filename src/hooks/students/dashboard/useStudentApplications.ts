import axios from 'axios';
import { Session } from 'next-auth';

import { useCallback, useEffect, useState } from 'react';

import { JobApplicationFull } from '@/types/application_status.type';

export function useStudentApplications(session: Session | null) {
  const [applications, setApplications] = useState<JobApplicationFull[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get('/api/student/job-applications');
      setApplications(response.data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const deleteApplication = useCallback(async (applicationId: string) => {
    try {
      await axios.delete(`/api/student/job-applications/${applicationId}`);
      setApplications((prevApplications) =>
        prevApplications.filter((app) => app.id !== applicationId),
      );
      return true;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  }, []);

  return {
    applications,
    setApplications,
    isLoading,
    error,
    deleteApplication,
    refreshApplications: fetchApplications,
  };
}
