'use client';

import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useState } from 'react';

import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useJob } from '@/context/job.context';

const JobView = () => {
  const { selectedJob } = useJob();
  const { data: session } = useSession();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!selectedJob || !session?.user?.id) {
      toast.error('Vous devez être connecté pour postuler');
      return;
    }

    setIsApplying(true);
    try {
      await axios.post('/api/students/job-requests', {
        jobId: selectedJob.id,
      });
      toast.success('Votre candidature a été envoyée avec succès');
    } catch (error) {
      console.error('Error applying for job:', error);
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage =
        axiosError.response?.data?.error ||
        "Une erreur est survenue lors de l'envoi de votre candidature";
      toast.error(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  if (!selectedJob) {
    return (
      <div className="sticky top-4 w-3/6">
        <Card className="p-6">
          <h1 className="text-center text-xl font-semibold text-gray-500">
            Sélectionnez une offre pour voir les détails
          </h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="sticky top-4 w-3/6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <ProfileAvatar
              firstName={selectedJob.companyName}
              lastName={''}
              photoUrl={selectedJob.logoUrl}
              size="lg"
              className="border-2 border-gray-200 dark:border-gray-700"
            />
            <div>
              <h1 className="text-2xl font-bold">{selectedJob.offerTitle}</h1>
              <p className="text-lg text-gray-500">{selectedJob.companyName}</p>
            </div>
          </div>

          <div className="mb-6 flex gap-2">
            <StatusBadge status={selectedJob.status} />
            {selectedJob.availability && (
              <span className="text-muted-foreground text-sm">{selectedJob.availability}</span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="text-gray-600">{selectedJob.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Compétences requises</h2>
            <div className="flex flex-wrap gap-2">
              {selectedJob.skills.map((skill) => (
                <StatusBadge key={skill.id} status={skill.name} variant="outline" />
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleApply} disabled={isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Postuler à cette offre'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobView;
