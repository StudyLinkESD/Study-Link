export interface JobResponseDTO {
  id: string;
  companyId: string;
  name: string;
  featuredImage?: string;
  description: string;
  skills?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobDTO {
  companyId: string;
  name: string;
  featuredImage?: string;
  description: string;
  skills?: string;
}

export interface UpdateJobDTO {
  name?: string;
  featuredImage?: string;
  description?: string;
  skills?: string;
}
