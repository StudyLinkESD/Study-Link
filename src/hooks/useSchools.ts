import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface School {
  id: string;
  name: string;
}

export function useSchools() {
  const { data, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const response = await api.get<School[]>('/api/schools');
      return response.data;
    },
  });

  return {
    data,
    isLoading,
  };
}
