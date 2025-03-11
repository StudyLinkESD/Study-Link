export interface CreateSchoolDTO {
  name: string;
  domainId: string;
  logo?: string | null;
  owner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface UpdateSchoolDTO {
  name?: string;
  domainId?: string;
  logo?: string | null;
}

export interface SchoolResponseDTO {
  id: string;
  name: string;
  domainId: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
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
