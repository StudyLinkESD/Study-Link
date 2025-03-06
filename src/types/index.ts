import { Company, Student, User, Job, School, CompanyOwner } from '@prisma/client';

// Types utilitaires
export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type UploadFile = {
  uuid: string;
  fileUrl: string;
};

// Types pour les formulaires
export type UserFormData = Pick<User, 'firstname' | 'lastname' | 'email' | 'profilePictureId'>;

export type CompanyProfileFormData = Pick<Company, 'name' | 'logoId'> & {
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

export type StudentProfileFormData = Pick<
  Student,
  'status' | 'skills' | 'description' | 'previousCompanies' | 'availability' | 'curriculumVitaeId'
> & {
  schoolId: string;
  apprenticeshipRythm?: string;
};

export type JobFormData = Pick<Job, 'name' | 'description' | 'featuredImageId'> & {
  companyId: string;
  skills?: string;
};

// Types pour les réponses API
export type UserResponse = User & {
  profilePicture?: UploadFile;
};

export type CompanyResponse = Company & {
  companyOwners: (CompanyOwner & {
    user: User;
  })[];
};

export type StudentResponse = Student & {
  user: User;
  school: School;
  curriculumVitae?: UploadFile;
};

export type JobResponse = Job & {
  company: Company;
  featuredImage?: UploadFile;
};
