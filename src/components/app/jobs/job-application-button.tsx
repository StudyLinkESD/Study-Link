'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { JobApplicationModal } from '@/components/app/jobs/Job-application-modal';
import { Button } from '@/components/ui/button';

interface JobApplicationButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  hasApplied: boolean;
  isAuthenticated: boolean;
}

export function JobApplicationButton({
  jobId,
  jobTitle,
  companyName,
  hasApplied,
  isAuthenticated,
}: JobApplicationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsModalOpen(true);
  };

  if (hasApplied) {
    return (
      <Button disabled className="w-full">
        Candidature déjà envoyée
      </Button>
    );
  }

  return (
    <>
      <Button onClick={handleApplyClick} className="w-full">
        Postuler
      </Button>

      <JobApplicationModal
        jobId={jobId}
        jobTitle={jobTitle}
        companyName={companyName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
