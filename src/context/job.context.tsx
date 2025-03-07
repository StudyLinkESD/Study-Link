'use client';

import { ReactNode } from 'react';

import { JobCardProps } from '@/components/app/jobs/JobCard';

import { createContextHook } from './createContextHook';

const { Provider, useContextHook } = createContextHook<JobCardProps>('Job');

export function JobProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

export function useJob() {
  const { state, setState } = useContextHook();

  return {
    selectedJob: state,
    setSelectedJob: setState,
  };
}
