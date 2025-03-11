export interface JobResponseDTO {
  id: string;
  companyId: string;
  name: string;
  featuredImage?: string;
  description: string;
  company?: {
    name: string;
    logo?: string;
  };
  skills: string[];
  type: string;
  availability?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobDTO {
  companyId: string;
  name: string;
  featuredImage?: string;
  description: string;
  skills: string[];
  type: string;
  availability?: string;
}

export interface UpdateJobDTO {
  name?: string;
  featuredImage?: string;
  description?: string;
  skills?: string[];
  type?: string;
  availability?: string;
}
