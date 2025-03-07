'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useJob } from '@/context/job.context';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import JobTypeBadge from '@/components/app/common/JobTypeBadge';
import SkillBadge from '@/components/app/common/SkillBadge';

const JobView = () => {
  const { selectedJob } = useJob();

  if (!selectedJob) {
    return (
      <div className="w-3/6 sticky top-4">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-center text-gray-500">
            Sélectionnez une offre pour voir les détails
          </h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-3/6 sticky top-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
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

          <div className="flex gap-2 mb-6">
            <JobTypeBadge type={selectedJob.status} />
            {selectedJob.availability && (
              <span className="text-sm text-muted-foreground">{selectedJob.availability}</span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{selectedJob.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Compétences requises</h2>
            <div className="flex flex-wrap gap-2">
              {selectedJob.skills.map((skill) => (
                <SkillBadge key={skill.id} label={skill.name} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobView;
