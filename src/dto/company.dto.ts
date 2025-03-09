export interface CompanyResponseDTO {
  id: string;
  name: string;
  logo?: string | null;
  companyOwners?: {
    userId: string;
  }[];
}

export interface CreateCompanyDTO {
  name: string;
  logo?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  logo?: string;
}
