'use client';

import { Edit, Trash2 } from 'lucide-react';

import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { FormattedJob } from '@/types/jobs';

interface JobCardProps {
  job: FormattedJob;
  onEdit: (job: FormattedJob) => void;
  onDelete: (id: string) => void;
  onClick?: (job: FormattedJob) => void;
  isSelected?: boolean;
}

export function JobCard({ job, onEdit, onDelete, onClick, isSelected = false }: JobCardProps) {
  return (
    <Card
      className={`cursor-pointer overflow-hidden ${isSelected ? 'ring-primary ring-2' : ''}`}
      onClick={() => onClick && onClick(job)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            firstName={job.companyName}
            lastName={''}
            photoUrl={job.logoUrl}
            size="md"
            className="border-2 border-gray-200 dark:border-gray-700"
          />

          <div className="flex flex-col">
            <h3 className="text-md font-medium text-gray-500">{job.companyName}</h3>
            <h3 className="text-lg font-semibold">{job.offerTitle}</h3>

            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={job.status} />

              {job.availability && (
                <span className="text-muted-foreground text-xs">{job.availability}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="mb-2 text-sm font-medium">Compétences requises</h4>

          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 5).map((skill) => (
              <StatusBadge
                key={skill.id}
                status={skill.name}
                variant="outline"
                className="text-xs"
              />
            ))}
            {job.skills.length > 5 && (
              <StatusBadge
                status={`+${job.skills.length - 5}`}
                variant="outline"
                className="text-xs"
              />
            )}
          </div>
          <p className="mt-2 text-gray-500">◦ {job.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button variant="outline" size="sm" className="text-primary" onClick={() => onEdit(job)}>
          <Edit className="mr-1 h-4 w-4" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => onDelete(job.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
}
