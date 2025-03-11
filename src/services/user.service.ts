import { User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { UserType } from '@/types/user.type';

export interface UserFilters {
  type?: UserType;
  schoolId?: string;
  page?: number;
  limit?: number;
}

export async function getUsers(filters: UserFilters = {}) {
  const { type, schoolId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(type === UserType.ADMIN && { admin: { isNot: null }, schoolOwner: null }),
    ...(type === UserType.SCHOOL_OWNER && { schoolOwner: { isNot: null }, admin: null }),
    ...(type === UserType.COMPANY_OWNER && { companyOwner: { isNot: null } }),
    ...(type === UserType.STUDENT && {
      student: schoolId ? { schoolId } : { isNot: null },
    }),
  };

  const users = await prisma.user.findMany({
    where,
    include: {
      admin: true,
      schoolOwner: {
        include: {
          school: true,
        },
      },
      companyOwner: {
        include: {
          company: true,
        },
      },
      student: {
        include: {
          school: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

export async function getUsersBySchool(schoolId: string) {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          schoolOwner: {
            schoolId,
          },
        },
        {
          student: {
            schoolId,
          },
        },
      ],
      deletedAt: null,
    },
    include: {
      schoolOwner: true,
      student: true,
    },
  });
}

export const userService = {
  async getUsers(params?: {
    type?: UserType;
    school?: string;
    page?: number;
    limit?: number;
  }): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.set('type', params.type);
      if (params?.school) queryParams.set('school', params.school);
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());

      const response = await fetch(`/api/users?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      return await response.json();
    } catch {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  },

  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération de l'utilisateur");
      return await response.json();
    } catch {
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'utilisateur");
      return await response.json();
    } catch {
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  },
};
