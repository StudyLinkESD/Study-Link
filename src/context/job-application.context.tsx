'use client';

import { ReactNode } from 'react';

import { JobApplicationFull } from '@/types/application_status.type';

import { createContextHook } from './createContextHook';

const { Provider, useContextHook } = createContextHook<JobApplicationFull>('JobApplication');

export function JobApplicationProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

export function useJobApplication() {
  const { state, setState } = useContextHook();

  return {
    selectedApplication: state,
    setSelectedApplication: setState,
  };
}
