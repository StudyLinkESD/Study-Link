export interface CreateSchoolDomainDTO {
  domain: string;
}

export interface UpdateSchoolDomainDTO {
  domain?: string;
}

export interface SchoolDomainResponseDTO {
  id: string;
  domain: string;
  schoolCount?: number;
}

export interface ValidateSchoolEmailDTO {
  email: string;
}
