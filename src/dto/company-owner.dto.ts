export interface CreateCompanyOwnerDTO {
  userId: string;
  companyId: string;
}

export interface UpdateCompanyOwnerDTO {
  userId?: string;
  companyId?: string;
}

export interface CompanyOwnerResponseDTO {
  id: string;
  userId: string;
  companyId: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
  };
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
}

export interface CompanyOwnerDetailsDTO extends CompanyOwnerResponseDTO {
  company: {
    id: string;
    name: string;
    logo: string | null;
    jobs: {
      id: string;
      name: string;
      type: string;
      createdAt: Date;
    }[];
  };
}
