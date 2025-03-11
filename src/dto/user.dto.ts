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

export interface BaseUserResponseDTO {
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

export interface SchoolDTO {
  id: string;
  name: string;
  logo: string | null;
  domain: {
    id: string;
    domain: string;
  };
}

export interface CompanyDTO {
  id: string;
  name: string;
  logo: string | null;
}

export interface JobRequestDTO {
  id: string;
  status: string;
  createdAt: Date;
  job: {
    id: string;
    name: string;
    company: CompanyDTO;
  };
}

export interface StudentDetailsDTO {
  id: string;
  schoolId: string;
  status: string;
  skills: string;
  apprenticeshipRhythm: string | null;
  description: string;
  curriculumVitae: string | null;
  previousCompanies: string;
  availability: boolean;
  school: SchoolDTO;
  jobRequests: JobRequestDTO[];
}

export interface CompanyOwnerDetailsDTO {
  id: string;
  company: CompanyDTO & {
    jobs: Array<{
      id: string;
      name: string;
      status: string;
      createdAt: Date;
    }>;
  };
}

export interface SchoolOwnerDetailsDTO {
  id: string;
  school: SchoolDTO;
}

export interface AdminDetailsDTO {
  id: string;
}

export interface EnrichedUserResponseDTO extends BaseUserResponseDTO {
  student?: StudentDetailsDTO | null;
  companyOwner?: CompanyOwnerDetailsDTO | null;
  schoolOwner?: SchoolOwnerDetailsDTO | null;
  admin?: AdminDetailsDTO | null;
}

export interface PaginatedUserResponseDTO {
  items: EnrichedUserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
