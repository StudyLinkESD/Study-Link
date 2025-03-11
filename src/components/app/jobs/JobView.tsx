'use client';

import { useSession } from 'next-auth/react';

import StatusBadge from '@/components/app/common/StatusBadge';
import { JobApplicationButton } from '@/components/app/jobs/job-application-button';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Card, CardContent } from '@/components/ui/card';

import { useJob } from '@/context/job.context';

interface JobViewProps {
  className?: string;
}

const JobView = ({ className = '' }: JobViewProps) => {
  const { selectedJob } = useJob();
  const { data: session } = useSession();

  if (!selectedJob) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <h1 className="text-center text-xl font-semibold text-gray-500">
            Sélectionnez une offre pour voir les détails
          </h1>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
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

        <JobApplicationButton
          jobId={selectedJob.id}
          jobTitle={selectedJob.offerTitle}
          companyName={selectedJob.companyName}
          hasApplied={false}
          isAuthenticated={!!session}
        />
      </CardContent>
    </Card>
  );
};

export default JobView;
