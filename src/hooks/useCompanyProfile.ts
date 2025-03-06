import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CompanyProfileFormData } from '@/types/company.type';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CompanyProfileResponse extends CompanyProfileFormData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useCompanyProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<
    CompanyProfileResponse,
    AxiosError,
    CompanyProfileResponse
  >({
    queryKey: ['companyProfile'],
    queryFn: async () => {
      try {
        const response = await api.get<CompanyProfileResponse>('/api/company/profile');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
        }
        throw error;
      }
    },
  });

  const { mutateAsync: updateProfile, isPending } = useMutation<
    CompanyProfileResponse,
    AxiosError,
    CompanyProfileFormData
  >({
    mutationFn: async (data: CompanyProfileFormData) => {
      try {
        const response = await api.put<CompanyProfileResponse>('/api/company/profile', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du profil:', error);
    },
  });

  return {
    profile: data,
    isLoading,
    isUpdating: isPending,
    error,
    updateProfile,
  };
}
