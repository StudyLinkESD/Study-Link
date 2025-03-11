import { prisma } from '@/lib/prisma';

import {
  CreateSchoolDTO,
  SchoolFilters,
  SchoolResponseDTO,
  UpdateSchoolDTO,
} from '@/dto/school.dto';

export const schoolService = {
  async getSchools(filters?: SchoolFilters): Promise<SchoolResponseDTO[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.set('page', filters.page.toString());
      if (filters?.limit) queryParams.set('limit', filters.limit.toString());
      if (filters?.search) queryParams.set('search', filters.search);
      if (filters?.isActive !== undefined) queryParams.set('isActive', filters.isActive.toString());
      if (filters?.domainId) queryParams.set('domainId', filters.domainId);
      if (filters?.orderBy) queryParams.set('orderBy', filters.orderBy);
      if (filters?.order) queryParams.set('order', filters.order);

      const response = await fetch(`/api/schools?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des écoles');
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des écoles:', error);
      throw error;
    }
  },

  async getSchoolById(id: string): Promise<SchoolResponseDTO | null> {
    try {
      const response = await fetch(`/api/schools/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Erreur lors de la récupération de l'école");
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'école:", error);
      throw error;
    }
  },

  async createSchool(data: CreateSchoolDTO): Promise<SchoolResponseDTO> {
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la création de l'école");
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'école:", error);
      throw error;
    }
  },

  async updateSchool(id: string, data: UpdateSchoolDTO): Promise<SchoolResponseDTO> {
    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'école");
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'école:", error);
      throw error;
    }
  },

  async deleteSchool(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression de l'école");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'école:", error);
      throw error;
    }
  },

  async getSchoolByEmailDomain(email: string): Promise<SchoolResponseDTO | null> {
    try {
      const domain = email.split('@')[1];
      const school = await prisma.school.findFirst({
        where: {
          domain: {
            domain: domain,
          },
          deletedAt: null,
        },
        include: {
          domain: true,
        },
      });
      return school as SchoolResponseDTO | null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'école par domaine:", error);
      throw error;
    }
  },
};
