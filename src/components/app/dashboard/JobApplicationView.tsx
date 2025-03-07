'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import ApplicationStatusBadge from '@/components/app/common/ApplicationStatusBadge';
import { useJobApplication } from '@/context/job-application.context';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { ApplicationStatus } from '@/utils/students/dashboard/status-mapping.utils';
import { JobApplicationsListProps } from './JobApplicationsList';

// Type pour le mapping des statuts
type StatusMappingType = {
  [key in ApplicationStatus]: string;
};

export default function JobApplicationView({
  applications,
  setApplications,
}: JobApplicationsListProps) {
  const { selectedApplication, setSelectedApplication } = useJobApplication();

  const updateApplicationStatus = async (newStatus: ApplicationStatus) => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/job-requests/${selectedApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update application status');

      // Mise à jour des applications dans l'état local
      const updatedApplications = applications.map((app) =>
        app.id === selectedApplication.id ? { ...app, status: newStatus } : app,
      );

      setApplications(updatedApplications);
      setSelectedApplication({ ...selectedApplication, status: newStatus });

      toast.success(`Statut mis à jour avec succès: ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMapping: StatusMappingType = {
      PENDING: 'En attente',
      ACCEPTED: 'Acceptée',
      REJECTED: 'Rejetée',
    };
    return statusMapping[status as ApplicationStatus] || status;
  };

  if (!selectedApplication) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <CardContent className="text-center">
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            Sélectionnez une candidature
          </h3>
          <p className="text-sm text-muted-foreground">
            Cliquez sur une candidature pour voir les détails
          </p>
        </CardContent>
      </Card>
    );
  }

  const { student, job, status, createdAt, updatedAt } = selectedApplication;
  const { firstname, lastname } = student.user;

  const formattedCreatedDate = format(new Date(createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr });
  const formattedUpdatedDate = format(new Date(updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr });

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-xl">Détails de la candidature</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informations sur le candidat */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Candidat</h3>
          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
            <ProfileAvatar
              firstName={firstname}
              lastName={lastname}
              photoUrl=""
              size="md"
              className="border border-gray-200 dark:border-gray-700"
            />
            <div>
              <h4 className="font-medium">{`${firstname} ${lastname}`}</h4>
              <Button variant="link" className="px-0 h-auto text-sm text-primary" asChild>
                <a href={`/students/${student.id}`}>Voir profil</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Informations sur l'offre */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Offre</h3>
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium">{job.name}</h4>
            <p className="text-sm text-muted-foreground">{job.company.name}</p>
            <Button variant="link" className="px-0 h-auto text-sm text-primary" asChild>
              <a href={`/jobs/${job.id}`}>Voir l&apos;offre</a>
            </Button>
          </div>
        </div>

        {/* Statut de la candidature */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Statut</h3>
            <ApplicationStatusBadge status={status} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="status-select">Mettre à jour le statut</Label>
            <Select
              defaultValue={status}
              onValueChange={(value: ApplicationStatus) => updateApplicationStatus(value)}
            >
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="ACCEPTED">Acceptée</SelectItem>
                <SelectItem value="REJECTED">Rejetée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 pt-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium">Date de candidature:</span> {formattedCreatedDate}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">Dernière modification:</span> {formattedUpdatedDate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
