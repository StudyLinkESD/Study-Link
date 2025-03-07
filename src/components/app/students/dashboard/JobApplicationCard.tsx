'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationStatusBadge from '@/components/app/common/ApplicationStatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { useJobApplication } from '@/context/job-application.context';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ApplicationStatus } from '@/utils/students/dashboard/status-mapping.utils';

type JobApplicationCardProps = {
  application: {
    id: string;
    studentId: string;
    jobId: string;
    status: ApplicationStatus | string;
    createdAt: string;
    updatedAt: string;
    student: {
      id: string;
      userId: string;
      user: {
        id: string; // Added
        createdAt: Date; // Added
        updatedAt: Date; // Added
        deletedAt: Date | null; // Added
        email: string; // Added
        firstname: string;
        lastname: string;
        profilePictureId: string | null;
        emailVerified: Date | null; // Added
      };
    };
    job: {
      id: string;
      name: string;
      companyId: string;
      company: {
        name: string;
        logoId: string | null;
      };
    };
  };
  onDeleteClick: () => void;
};

export default function JobApplicationCard({
  application,
  onDeleteClick,
}: JobApplicationCardProps) {
  const { setSelectedApplication, selectedApplication } = useJobApplication();
  const { student, job, status, createdAt } = application;
  const { firstname, lastname } = student.user;

  const handleClick = () => {
    setSelectedApplication(application);
  };

  const formattedDate = React.useMemo(() => {
    return format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr });
  }, [createdAt]);

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
              firstName={firstname}
              lastName={lastname}
              photoUrl=""
              size="sm"
              className="border border-gray-200 dark:border-gray-700"
            />
            <div>
              <h3 className="text-base font-medium">{`${firstname} ${lastname}`}</h3>
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
          <ApplicationStatusBadge status={status} />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        <div className="mt-2">
          <p className="text-xs text-muted-foreground">{job.company.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}
