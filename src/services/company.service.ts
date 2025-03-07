import { prisma } from '@/lib/prisma';

export interface CompanyFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCompanies(filters: CompanyFilters = {}) {
  const { search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        companyOwners: {
          include: {
            user: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}
