import { Prisma } from '@prisma/client';

import {
  CompanyOwnerFilters,
  ExperienceFilters,
  JobFilters,
  PaginationParams,
  SchoolDomainFilters,
  SchoolFilters,
  SchoolOwnerFilters,
  StudentFilters,
  UserFilters,
} from '@/types/filters.type';

export class FilterService {
  static buildUserWhereClause(filters: UserFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.schoolId) {
      where.OR = [
        { student: { schoolId: filters.schoolId } },
        { schoolOwner: { schoolId: filters.schoolId } },
      ];
    }

    if (filters.companyId) {
      where.companyOwner = { companyId: filters.companyId };
    }

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isProfileCompleted !== undefined) {
      where.profileCompleted = filters.isProfileCompleted;
    }

    if (filters.isVerified !== undefined) {
      where.emailVerified = filters.isVerified ? { not: null } : null;
    }

    const dateFilters: Prisma.UserWhereInput['createdAt'] = {};

    if (filters.createdAfter) {
      dateFilters.gte = filters.createdAfter;
    }

    if (filters.createdBefore) {
      dateFilters.lte = filters.createdBefore;
    }

    if (Object.keys(dateFilters).length > 0) {
      where.createdAt = dateFilters;
    }

    return where;
  }

  static buildStudentWhereClause(filters: StudentFilters): Prisma.StudentWhereInput {
    const where: Prisma.StudentWhereInput = {};

    if (filters.schoolId) {
      where.schoolId = filters.schoolId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { skills: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.skills?.length) {
      where.AND = filters.skills.map((skill) => ({
        skills: { contains: skill, mode: 'insensitive' },
      }));
    }

    if (filters.availability !== undefined) {
      where.availability = filters.availability;
    }

    if (filters.apprenticeshipRhythm) {
      where.apprenticeshipRhythm = {
        contains: filters.apprenticeshipRhythm,
        mode: 'insensitive',
      };
    }

    return where;
  }

  static buildExperienceWhereClause(filters: ExperienceFilters): Prisma.ExperienceWhereInput {
    const where: Prisma.ExperienceWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.company) {
      where.company = {
        contains: filters.company,
        mode: 'insensitive',
      };
    }

    if (filters.startDateAfter || filters.startDateBefore) {
      where.startDate = {};
      if (filters.startDateAfter) {
        where.startDate.gte = filters.startDateAfter;
      }
      if (filters.startDateBefore) {
        where.startDate.lte = filters.startDateBefore;
      }
    }

    if (filters.search) {
      where.OR = [
        { position: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  static buildPaginationOptions(params: PaginationParams): {
    skip?: number;
    take?: number;
    orderBy?: {
      [key: string]: 'asc' | 'desc';
    };
  } {
    return {
      skip: params.page ? (params.page - 1) * (params.limit || 10) : 0,
      take: params.limit || 10,
      orderBy: params.orderBy
        ? {
            [params.orderBy]: params.order || 'desc',
          }
        : undefined,
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
                  type: true,
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

  static getDefaultStudentInclude(): Prisma.StudentInclude {
    return {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      experiences: {
        orderBy: { startDate: 'desc' },
      },
      jobRequests: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
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
      },
    };
  }

  static buildSchoolWhereClause(filters: SchoolFilters): Prisma.SchoolWhereInput {
    const where: Prisma.SchoolWhereInput = {
      deletedAt: null,
    };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.domainId) {
      where.domainId = filters.domainId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { domain: { domain: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  static buildSchoolOwnerWhereClause(filters: SchoolOwnerFilters): Prisma.SchoolOwnerWhereInput {
    const where: Prisma.SchoolOwnerWhereInput = {};

    if (filters.schoolId) {
      where.schoolId = filters.schoolId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { school: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  static buildSchoolDomainWhereClause(
    filters: SchoolDomainFilters,
  ): Prisma.AuthorizedSchoolDomainWhereInput {
    const where: Prisma.AuthorizedSchoolDomainWhereInput = {};

    if (filters.search) {
      where.domain = {
        contains: filters.search,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    if (filters.hasSchools !== undefined) {
      where.schools = filters.hasSchools
        ? {
            some: {
              deletedAt: null,
            },
          }
        : {
            none: {
              deletedAt: null,
            },
          };
    }

    return where;
  }

  static buildJobWhereClause(filters: JobFilters): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {
      deletedAt: null,
    };

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.availability) {
      where.availability = filters.availability;
    }

    if (filters.skills?.length) {
      where.AND = filters.skills.map((skill) => ({
        skills: {
          contains: skill,
          mode: 'insensitive',
        },
      }));
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const dateFilters: Prisma.JobWhereInput['createdAt'] = {};

    if (filters.createdAfter) {
      dateFilters.gte = filters.createdAfter;
    }

    if (filters.createdBefore) {
      dateFilters.lte = filters.createdBefore;
    }

    if (Object.keys(dateFilters).length > 0) {
      where.createdAt = dateFilters;
    }

    return where;
  }

  static buildCompanyOwnerWhereClause(filters: CompanyOwnerFilters): Prisma.CompanyOwnerWhereInput {
    const where: Prisma.CompanyOwnerWhereInput = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
