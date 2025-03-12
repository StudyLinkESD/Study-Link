'use client';

import React from 'react';

import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Card, CardContent } from '@/components/ui/card';

import { useJob } from '@/context/job.context';

export type JobCardProps = {
  id: string;
  offerTitle: string;
  companyName: string;
  logoUrl: string;
  status: 'Alternance' | 'Stage';
  description: string;
  skills: { id: string; name: string }[];
  availability?: string;
};

export default function JobCard(props: JobCardProps) {
  const { setSelectedJob } = useJob();
  const { offerTitle, companyName, logoUrl, status, skills, availability, description } = props;

  const handleClick = () => {
    setSelectedJob(props);
  };

  return (
    <Card className="cursor-pointer overflow-hidden" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            firstName={companyName}
            lastName={''}
            photoUrl={logoUrl}
            size="md"
            className="border-2 border-gray-200 dark:border-gray-700"
          />

          <div className="flex flex-col">
            <h3 className="text-md font-medium text-gray-500">{companyName}</h3>
            <h3 className="text-lg font-semibold">{offerTitle}</h3>

            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={status} />

              {availability && (
                <span className="text-muted-foreground text-xs">{availability}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="mb-2 text-sm font-medium">Compétences requises</h4>

          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 5).map((skill) => (
              <StatusBadge
                key={skill.id}
                status={skill.name}
                variant="outline"
                className="text-xs"
              />
            ))}
            {skills.length > 5 && (
              <StatusBadge status={`+${skills.length - 5}`} variant="outline" className="text-xs" />
            )}
          </div>
          <p className="mt-2 text-gray-500">◦ {description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
