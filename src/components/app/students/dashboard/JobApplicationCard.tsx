'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { useJobApplication } from '@/context/job-application.context';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getStatusLabel, getStatusVariant } from '@/utils/students/dashboard/status-mapping.utils';
import { JobApplicationFull } from '@/types/application_status.type';

type JobApplicationCardProps = {
  application: JobApplicationFull;
  onDeleteClick: () => void;
};

export default function JobApplicationCard({
  application,
  onDeleteClick,
}: JobApplicationCardProps) {
  const { setSelectedApplication, selectedApplication } = useJobApplication();
  const { student, job, status, createdAt } = application;
  const { firstName, lastName } = student.user;

  const handleClick = () => {
    setSelectedApplication(application);
  };

  const formattedDate = React.useMemo(() => {
    return format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr });
  }, [createdAt]);

  const displayStatus = getStatusLabel(status);

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all ${
        selectedApplication?.id === application.id ? 'ring-2 ring-primary' : 'hover:border-gray-300'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              firstName={firstName}
              lastName={lastName}
              photoUrl=""
              size="sm"
              className="border border-gray-200 dark:border-gray-700"
            />
            <div>
              <h3 className="text-base font-medium">{`${firstName} ${lastName}`}</h3>
              <p className="text-sm text-muted-foreground">{job.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={displayStatus} variant={getStatusVariant(status)} />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        <div className="mt-2">
          <p className="text-xs text-muted-foreground">{job.company.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}
