'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type JobApplication = {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    userId: string;
    user: {
      firstname: string;
      lastname: string;
      profilePictureId: string | null;
    };
  };
  job: {
    id: string;
    name: string;
    companyId: string;
    company: {
      name: string;
      logoId: string | null;
    };
  };
};

interface JobApplicationContextType {
  selectedApplication: JobApplication | null;
  setSelectedApplication: (application: JobApplication | null) => void;
}

const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

export function JobApplicationProvider({ children }: { children: ReactNode }) {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  return (
    <JobApplicationContext.Provider value={{ selectedApplication, setSelectedApplication }}>
      {children}
    </JobApplicationContext.Provider>
  );
}

export function useJobApplication() {
  const context = useContext(JobApplicationContext);
  if (!context) {
    throw new Error('useJobApplication must be used within a JobApplicationProvider');
  }
  return context;
}
