import { Prisma } from '@prisma/client';

import { PaginationParams, UserFilters } from '@/types/filters.type';

export class FilterService {
  static buildUserWhereClause(filters: UserFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.schoolId && {
        OR: [
          { student: { schoolId: filters.schoolId } },
          { schoolOwner: { schoolId: filters.schoolId } },
        ],
      }),
      ...(filters.companyId && {
        companyOwner: { companyId: filters.companyId },
      }),
      ...(filters.search && {
        OR: [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.isProfileCompleted !== undefined && {
        profileCompleted: filters.isProfileCompleted,
      }),
      ...(filters.createdAfter && {
        createdAt: { gte: filters.createdAfter },
      }),
      ...(filters.createdBefore && {
        createdAt: { lte: filters.createdBefore },
      }),
      ...(filters.isVerified !== undefined && {
        emailVerified: filters.isVerified ? { not: null } : null,
      }),
    };
    return where;
  }

  static buildPaginationOptions(params: PaginationParams): Prisma.UserFindManyArgs {
    return {
      skip: params.page ? (params.page - 1) * (params.limit || 10) : 0,
      take: params.limit || 10,
      orderBy: params.orderBy
        ? {
            [params.orderBy]: params.order || 'desc',
          }
        : {
            createdAt: 'desc',
          },
    };
  }

  static getDefaultUserInclude(): Prisma.UserInclude {
    return {
      student: {
        include: {
          school: {
            include: {
              domain: true,
            },
          },
          jobRequests: {
            where: { deletedAt: null },
            include: {
              job: {
                include: {
                  company: {
                    select: {
                      id: true,
                      name: true,
                      logo: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
      companyOwner: {
        include: {
          company: {
            include: {
              jobs: {
                where: { deletedAt: null },
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  id: true,
                  name: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
      schoolOwner: {
        include: {
          school: {
            include: {
              domain: true,
            },
          },
        },
      },
      admin: true,
    };
  }
}
