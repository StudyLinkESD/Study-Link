import axios from 'axios';
import { Session } from 'next-auth';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import { useCompanyId } from '@/hooks/useCompanyId';

export type JobRequestWithRelations = {
  id: string;
  jobId: string;
  studentId: string;
  status: string;
  subject?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  job: {
    id: string;
    name: string;
    company: {
      name: string;
      logo?: string;
    };
  };
};

export type Job = {
  id: string;
  companyId: string;
  name: string;
  offerTitle?: string;
};

export function useCompanyJobRequests(session: Session | null) {
  const { companyId, isLoading: isLoadingCompany } = useCompanyId(session);
  const [requests, setRequests] = useState<JobRequestWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJobRequests = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/companies/${companyId}/job-requests`);
      setRequests(response.data);
    } catch (err) {
      setError(err as Error);
      toast.error('Erreur lors du chargement des candidatures');
      console.error('Erreur lors du chargement des candidatures:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchJobRequests();
    }
  }, [companyId, fetchJobRequests]);

  const updateRequestStatus = useCallback(async (requestId: string, newStatus: string) => {
    try {
      await axios.put(`/api/students/job-requests/${requestId}`, { status: newStatus });

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)),
      );

      toast.success('Statut mis à jour avec succès');
      return true;
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Erreur lors de la mise à jour du statut:', err);
      return false;
    }
  }, []);

  return {
    requests,
    isLoading: isLoading || isLoadingCompany,
    error,
    updateRequestStatus,
    refreshRequests: fetchJobRequests,
    companyId,
  };
}
