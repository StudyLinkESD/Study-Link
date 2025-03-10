'use client';

import { ReactNode } from 'react';

import { JobRequestFull } from '@/types/request_status.type';

import { createContextHook } from './createContextHook';

const { Provider, useContextHook } = createContextHook<JobRequestFull>('JobRequest');

export function JobRequestProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

export function useJobRequest() {
  const { state, setState } = useContextHook();

  return {
    selectedRequest: state,
    setSelectedRequest: setState,
  };
}
