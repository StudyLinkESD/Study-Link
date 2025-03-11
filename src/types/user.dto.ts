export type BaseUserResponseDTO = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  type: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SchoolDTO = {
  id: string;
  name: string;
  logo: string | null;
};

export type CompanyDTO = {
  id: string;
  name: string;
  logo: string | null;
};

export type JobRequestDTO = {
  id: string;
  status: string;
  createdAt: string;
};

export type StudentDetailsDTO = {
  id: string;
  school: SchoolDTO;
  jobRequests: JobRequestDTO[];
};

export type CompanyOwnerDetailsDTO = {
  id: string;
  company: CompanyDTO;
};

export type SchoolOwnerDetailsDTO = {
  id: string;
  school: SchoolDTO;
};

export type AdminDetailsDTO = {
  id: string;
};

export type EnrichedUserResponseDTO = BaseUserResponseDTO & {
  student?: StudentDetailsDTO;
  companyOwner?: CompanyOwnerDetailsDTO;
  schoolOwner?: SchoolOwnerDetailsDTO;
  admin?: AdminDetailsDTO;
  company?: CompanyDTO;
};

export type CreateUserDTO = {
  email: string;
  firstName?: string;
  lastName?: string;
  type: string;
  profilePicture?: string;
  schoolId?: string;
  companyId?: string;
};

export type UpdateUserDTO = Partial<CreateUserDTO>;

export type PaginatedUserResponseDTO = {
  data: EnrichedUserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
