import { Prisma } from '@prisma/client';
import { ApplicationStatus } from '@/utils/students/dashboard/status-mapping.utils';

export type StatusMappingType = {
  [key in ApplicationStatus]: string;
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

export type JobApplicationFull = {
  id: string;
  studentId: string;
  jobId: string;
  status: ApplicationStatus | string;
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

export interface JobApplicationContextType {
  selectedApplication: JobApplicationFull | null;
  setSelectedApplication: (application: JobApplicationFull | null) => void;
}
