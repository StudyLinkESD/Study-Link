import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentProfileFormData } from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useStudentProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const url = `${API_URL}/students/profile`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }
      return response.json();
    },
  });

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: async (data: StudentProfileFormData) => {
      const url = `${API_URL}/students/profile`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
  });

  return {
    data,
    isLoading,
    updateProfile,
  };
}
