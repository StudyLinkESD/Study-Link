'use client';

import { ReactNode } from 'react';
import { createContextHook } from './createContextHook';
import { JobApplicationFull } from '@/types/application_status.type';

// Utilisation du hook factory pour créer le contexte et le hook
const { Provider, useContextHook } = createContextHook<JobApplicationFull>('JobApplication');

// Renommage du Provider pour maintenir la compatibilité avec le code existant
export function JobApplicationProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

// Adaptation du hook pour maintenir la compatibilité avec le code existant
export function useJobApplication() {
  const { state, setState } = useContextHook();

  return {
    selectedApplication: state,
    setSelectedApplication: setState,
  };
}
