import { UserType } from '@/types/user.type';

export interface BaseCreateUserDTO {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  type: UserType;
  profilePicture?: string | null;
  profileCompleted?: boolean;
}

export interface CreateStudentUserDTO extends BaseCreateUserDTO {
  type: UserType.STUDENT;
  schoolId: string;
  studentEmail: string;
  status: string;
  skills: string;
  apprenticeshipRhythm?: string | null;
  description: string;
  curriculumVitae?: string | null;
  previousCompanies: string;
  availability: boolean;
}

export interface CreateCompanyOwnerUserDTO extends BaseCreateUserDTO {
  type: UserType.COMPANY_OWNER;
  companyId: string;
}

export interface CreateSchoolOwnerUserDTO extends BaseCreateUserDTO {
  type: UserType.SCHOOL_OWNER;
  schoolId: string;
}

export interface CreateAdminUserDTO extends BaseCreateUserDTO {
  type: UserType.ADMIN;
}

export type CreateUserDTO =
  | CreateStudentUserDTO
  | CreateCompanyOwnerUserDTO
  | CreateSchoolOwnerUserDTO
  | CreateAdminUserDTO;

export interface UpdateUserDTO {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  profileCompleted?: boolean;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  type: UserType;
  profilePicture: string | null;
  profileCompleted: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserByIdResponseDTO {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture?: string | null;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    userId: string;
    schoolId: string;
    primaryRecommendationId?: string | null;
    status: string;
    skills: string;
    apprenticeshipRhythm?: string | null;
    description: string;
    curriculumVitae?: string | null;
    previousCompanies: string;
    availability: boolean;
    school: {
      id: string;
      name: string;
      domainId: string;
      logo?: string | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt?: Date | null;
    };
    jobRequests: Array<{
      id: string;
      studentId: string;
      jobId: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      job: {
        id: string;
        name: string;
        description: string;
        skills?: string | null;
        createdAt: Date;
        updatedAt: Date;
        company: {
          id: string;
          name: string;
          logo: string | null;
        };
        featuredImage: string | null;
      };
    }>;
    recommendations: Array<{
      id: string;
      studentId: string;
      recommenderId: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  } | null;
  schoolOwner?: {
    id: string;
    userId: string;
    schoolId: string;
    school: {
      id: string;
      name: string;
      domain: {
        id: string;
        domain: string;
      };
      logo: string | null;
    };
  } | null;
  companyOwner?: {
    id: string;
    userId: string;
    companyId: string;
    company: {
      id: string;
      name: string;
      logo: string | null;
      jobs: Array<{
        id: string;
        name: string;
        description: string;
        skills?: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>;
    };
  } | null;
  admin?: {
    id: string;
    userId: string;
  } | null;
}
