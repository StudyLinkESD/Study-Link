'use client';

import { ReactNode } from 'react';
import { createContextHook } from './createContextHook';
import { JobCardProps } from '@/components/app/jobs/JobCard';

// Utilisation du hook factory pour créer le contexte et le hook
const { Provider, useContextHook } = createContextHook<JobCardProps>('Job');

// Renommage du Provider pour maintenir la compatibilité avec le code existant
export function JobProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

// Adaptation du hook pour maintenir la compatibilité avec le code existant
export function useJob() {
  const { state, setState } = useContextHook();

  return {
    selectedJob: state,
    setSelectedJob: setState,
  };
}
