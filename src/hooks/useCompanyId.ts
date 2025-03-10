import axios from 'axios';
import { Session } from 'next-auth';

import { useCallback, useEffect, useState } from 'react';

type CompanyData = {
  id: string;
  name: string;
  logo?: string | null;
};

type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
  company?: CompanyData;
};

export function useCompanyId(session: Session | null) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanyId = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<UserResponse>('/api/users/current');

      if (response.data.company) {
        setCompany(response.data.company);
      } else {
        setCompany(null);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchCompanyId();
  }, [fetchCompanyId]);

  return {
    company,
    companyId: company?.id,
    isLoading,
    error,
    refreshCompany: fetchCompanyId,
  };
}
