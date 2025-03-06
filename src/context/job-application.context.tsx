'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { JobApplicationContextType, JobApplicationFull } from '@/types/application_status.type';

const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

export function JobApplicationProvider({ children }: { children: ReactNode }) {
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationFull | null>(null);

  return (
    <JobApplicationContext.Provider value={{ selectedApplication, setSelectedApplication }}>
      {children}
    </JobApplicationContext.Provider>
  );
}

export function useJobApplication() {
  const context = useContext(JobApplicationContext);
  if (context === undefined) {
    throw new Error('useJobApplication must be used within a JobApplicationProvider');
  }
  return context;
}
