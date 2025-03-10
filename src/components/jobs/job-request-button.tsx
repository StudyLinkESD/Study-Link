'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface JobRequestButtonProps {
  jobId: string;
  hasApplied: boolean;
  isAuthenticated: boolean;
}

export function JobRequestButton({ jobId, hasApplied, isAuthenticated }: JobRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/students/job-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to apply');
      }

      toast.success('Candidature envoyée', {
        description: 'Votre candidature a été envoyée avec succès.',
      });

      router.refresh();
    } catch (error) {
      toast.error('Erreur', {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'envoi de votre candidature.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasApplied) {
    return (
      <Button disabled className="w-full">
        Candidature déjà envoyée
      </Button>
    );
  }

  return (
    <Button onClick={handleApply} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Envoi en cours...
        </>
      ) : (
        'Postuler'
      )}
    </Button>
  );
}
