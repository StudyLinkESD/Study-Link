import { School } from '@prisma/client';

export interface SchoolResponseDTO extends School {
  domain: {
    id: string;
    domain: string;
  };
}

export interface CreateSchoolDTO {
  name: string;
  logo?: string | null;
  domainId: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UpdateSchoolDTO {
  name?: string;
  logo?: string | null;
  domainId?: string;
  isActive?: boolean;
}

export interface SchoolFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  domainId?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateSchoolWithDomainDTO {
  school: {
    name: string;
    logo?: string | null;
  };
  domain: string;
  owner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface SchoolWithDomainResponseDTO {
  school: SchoolResponseDTO;
  domain: {
    id: string;
    domain: string;
  };
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}
