'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

import React from 'react';

import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { getStatusLabel, getStatusVariant } from '@/utils/students/dashboard/status-mapping.utils';

import { JobRequestFull } from '@/types/request_status.type';

import { useJobRequest } from '@/context/job-request.context';

// Réutilisation du type JobRequestFull pour JobApplicationFull
type JobApplicationFull = JobRequestFull;

type JobApplicationCardProps = {
  application: JobApplicationFull;
  onDeleteClick: () => void;
};

export default function JobApplicationCard({
  application,
  onDeleteClick,
}: JobApplicationCardProps) {
  const { setSelectedRequest, selectedRequest } = useJobRequest();
  const { student, job, status, createdAt } = application;
  const { firstName, lastName } = student.user;

  const handleClick = () => {
    setSelectedRequest(application);
  };

  const isSelected = selectedRequest?.id === application.id;

  return (
    <Card
      className={`hover:border-primary cursor-pointer transition-colors ${
        isSelected ? 'border-primary' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <ProfileAvatar
              photoUrl={student.user.profilePicture || undefined}
              firstName={firstName}
              lastName={lastName}
              size="sm"
              className="h-10 w-10"
            />
            <div>
              <h3 className="font-medium">{job.name}</h3>
              <p className="text-muted-foreground text-sm">{job.company.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={getStatusLabel(status)} variant={getStatusVariant(status)}>
                  {getStatusLabel(status)}
                </StatusBadge>
                <span className="text-muted-foreground text-xs">
                  {format(new Date(createdAt), 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
