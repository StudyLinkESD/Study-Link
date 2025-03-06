'use client';

import { NewSchoolForm } from '@/components/admin/schools/NewSchoolForm';
import { useRouter } from 'next/navigation';

export function NewSchoolFormWrapper() {
  const router = useRouter();
  return <NewSchoolForm onCancel={() => router.push('/admin/schools')} />;
}
