export interface JobResponseDTO {
  id: string;
  companyId: string;
  name: string;
  featuredImageId?: string;
  description: string;
  skills?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobDTO {
  companyId: string;
  name: string;
  featuredImageId?: string;
  description: string;
  skills?: string;
}

export interface UpdateJobDTO {
  name?: string;
  featuredImageId?: string;
  description?: string;
  skills?: string;
}
