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
}
