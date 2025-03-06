import { Prisma } from '@prisma/client';

// Define the application status type based on the existing schema
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type StatusMappingType = {
  [key in ApplicationStatus]: string;
};

// Define extended types with relations
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

export type JobApplicationFull = Prisma.JobRequestGetPayload<{
  include: {
    student: {
      include: {
        user: true;
      };
    };
    job: {
      include: {
        company: true;
      };
    };
  };
}>;

// Types for context
export interface JobApplicationContextType {
  selectedApplication: JobApplicationFull | null;
  setSelectedApplication: (application: JobApplicationFull | null) => void;
}
