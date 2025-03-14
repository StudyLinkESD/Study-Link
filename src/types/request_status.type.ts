import { Prisma } from '@prisma/client';

import { RequestStatus } from '@/utils/students/dashboard/status-mapping.utils';

export type StatusMappingType = {
  [key in RequestStatus]: string;
};

export type JobWithCompany = Prisma.JobGetPayload<{
  include: {
    company: true;
    featuredImage: true;
  };
}>;

export type StudentWithUser = Prisma.StudentGetPayload<{
  include: {
    user: true;
    curriculumVitae: true;
  };
}>;

export type JobRequestFull = {
  id: string;
  studentId: string;
  jobId: string;
  status: RequestStatus | string;
  subject: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    userId: string;
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      email: string;
      firstName: string | null;
      lastName: string | null;
      profilePicture: string | null;
      emailVerified: Date | null;
    };
  };
  job: {
    id: string;
    name: string;
    companyId: string;
    company: {
      name: string;
      logo: string | null;
    };
  };
};

export interface JobRequestContextType {
  selectedRequest: JobRequestFull | null;
  setSelectedRequest: (request: JobRequestFull | null) => void;
}
