'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { useJob } from '@/context/job.context';

// Import des composants communs
import ProfileAvatar from '@/components/app/common/ProfileAvatar';
import StatusBadge from '@/components/app/common/StatusBadge';

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
  const { id, offerTitle, companyName, logoUrl, status, skills, availability, description } = props;

  const handleClick = () => {
    setSelectedJob(props);
  };

  return (
    <Card className="overflow-hidden cursor-pointer" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Utilisation du composant ProfileAvatar */}
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

            <div className="flex items-center gap-2 mt-1">
              {/* Utilisation du composant StatusBadge */}
              <StatusBadge status={status} />

              {availability && (
                <span className="text-xs text-muted-foreground">{availability}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Compétences requises</h4>

          {/* Nous n'utilisons pas directement SkillsList car nous voulons limiter l'affichage à 5 skills */}
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
          <p className="text-gray-500 mt-2">◦ {description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-3">
        <Link
          href={`/jobs/${id}`}
          className="text-sm text-primary hover:underline flex ml-auto items-center"
        >
          Voir l&apos;offre
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
