import { JobRequestStatus } from '@/types/job-request.type';

export interface CreateJobRequestDTO {
  jobId: string;
  studentId: string;
  status: JobRequestStatus;
  subject?: string;
  message?: string;
}

export interface UpdateJobRequestDTO {
  status?: JobRequestStatus;
  subject?: string;
  message?: string;
}

export interface JobRequestResponseDTO {
  id: string;
  status: JobRequestStatus;
  subject: string | null;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    name: string;
    company: {
      id: string;
      name: string;
      logo: string | null;
    };
  };
  student: {
    id: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      profilePicture: string | null;
    };
  };
}

export interface PaginatedJobRequestResponseDTO {
  items: JobRequestResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
