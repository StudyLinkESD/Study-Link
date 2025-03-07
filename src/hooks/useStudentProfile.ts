import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StudentProfileFormData } from '@/types/student.type';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface StudentProfileResponse extends StudentProfileFormData {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    profilePicture: string | null;
  };
  school: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
}

export function useStudentProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<
    StudentProfileResponse,
    AxiosError,
    StudentProfileResponse
  >({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      try {
        const response = await api.get<StudentProfileResponse>('/api/student/profile');
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
    StudentProfileResponse,
    AxiosError,
    StudentProfileFormData
  >({
    mutationFn: async (data: StudentProfileFormData) => {
      try {
        const response = await api.put<StudentProfileResponse>('/api/student/profile', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
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
