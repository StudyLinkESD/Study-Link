'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

import React from 'react';

import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { JobRequestFull } from '@/types/request_status.type';

import { useJobRequest } from '@/context/job-request.context';

type JobRequestCardProps = {
  request: JobRequestFull;
  onDeleteClick: () => void;
};

export default function JobRequestCard({ request, onDeleteClick }: JobRequestCardProps) {
  const { setSelectedRequest, selectedRequest } = useJobRequest();
  const { student, job, status, createdAt } = request;
  const { firstName, lastName } = student.user;

  const handleClick = () => {
    setSelectedRequest(request);
  };

  const formattedDate = React.useMemo(() => {
    return format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr });
  }, [createdAt]);

  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-all ${
        selectedRequest?.id === request.id ? 'ring-primary ring-2' : 'hover:border-gray-300'
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
              <p className="text-muted-foreground text-sm">{job.name}</p>
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

        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={status} />
          <span className="text-muted-foreground text-xs">{formattedDate}</span>
        </div>

        <div className="mt-2">
          <p className="text-muted-foreground text-xs">{job.company.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}
