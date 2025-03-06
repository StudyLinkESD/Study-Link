export interface CreateJobRequestDTO {
  studentId: string;
  jobId: string;
  status: string;
}

export interface UpdateJobRequestDTO {
  status?: string;
}

export interface JobRequestResponseDTO {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrichedJobRequestResponseDTO {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  job: {
    name: string;
    description: string;
    skills: string | null;
    createdAt: Date;
    updatedAt: Date;
    company: {
      name: string;
      createdAt: Date;
      updatedAt: Date;
      logo: string | null;
    };
    featuredImage: string | null;
  };
}
