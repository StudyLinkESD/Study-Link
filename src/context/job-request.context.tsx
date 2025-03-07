'use client';

import { ReactNode } from 'react';
import { createContextHook } from './createContextHook';
import { JobRequestFull } from '@/types/job-request.type';

const { Provider, useContextHook } = createContextHook<JobRequestFull>('JobRequest');

export function JobRequestProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

export function useJobRequest() {
  const { state, setState } = useContextHook();

  return {
    selectedJobRequest: state,
    setSelectedJobRequest: setState,
  };
}
