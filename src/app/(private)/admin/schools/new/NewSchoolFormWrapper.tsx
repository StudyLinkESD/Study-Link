'use client';

import { useRouter } from 'next/navigation';

import { NewSchoolForm } from '@/components/admin/schools/NewSchoolForm';

export function NewSchoolFormWrapper() {
  const router = useRouter();
  return <NewSchoolForm onCancel={() => router.push('/admin/schools')} />;
}
