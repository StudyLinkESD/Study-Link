import { Company } from '@prisma/client';

export type CompanyProfileFormData = Pick<Company, 'name' | 'logo'> & {
  companyName: string;
  siret: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  industry: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  website?: string;
  logo?: string;
};
