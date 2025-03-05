'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { JobCardProps } from '@/components/app/jobs/JobCard';

type JobContextType = {
  selectedJob: JobCardProps | null;
  setSelectedJob: (job: JobCardProps | null) => void;
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [selectedJob, setSelectedJob] = useState<JobCardProps | null>(null);

  return (
    <JobContext.Provider value={{ selectedJob, setSelectedJob }}>{children}</JobContext.Provider>
  );
}

export function useJob() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}
