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
