interface ICompany {
  id: string;
  name: string;
  logo: string;
}

interface CompanyProfileFormData {
  name: string;
  logo?: { uuid: string; fileUrl: string } | null;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
}

export type { ICompany, CompanyProfileFormData };
