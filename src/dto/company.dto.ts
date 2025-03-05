export interface CompanyResponseDTO {
  id: string;
  name: string;
  logoId?: string | null;
}

export interface CreateCompanyDTO {
  name: string;
  logoId?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  logoId?: string;
}
