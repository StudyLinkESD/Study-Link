'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useStudentJobRequests } from '@/hooks/students/dashboard/useStudentJobRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/app/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { JOB_REQUEST_STATUS } from '@/constants/status';
import axios from 'axios';

const JobRequestStatusBadge = React.memo(({ status }: { status: string }) => {
  switch (status) {
    case JOB_REQUEST_STATUS.PENDING:
      return <StatusBadge status="En attente" variant="default" />;
    case JOB_REQUEST_STATUS.ACCEPTED:
      return <StatusBadge status="Acceptée" variant="success" />;
    case JOB_REQUEST_STATUS.REJECTED:
      return <StatusBadge status="Refusée" className="bg-red-200 text-red-800" />;
    default:
      return <StatusBadge status="Inconnu" variant="outline" />;
  }
});

JobRequestStatusBadge.displayName = 'JobRequestStatusBadge';

function StudentDashboardPageComponent() {
  const { data: session } = useSession();
  const { jobRequests, setJobRequests, isLoading } = useStudentJobRequests(session);
  const [statusFilter, setStatusFilter] = useState<string>(JOB_REQUEST_STATUS.ALL);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [jobRequestToDelete, setJobRequestToDelete] = useState<string | null>(null);

  const filteredJobRequests = useMemo(() => {
    return jobRequests.filter((req) => {
      const matchesStatus = statusFilter === JOB_REQUEST_STATUS.ALL || req.status === statusFilter;
      const matchesSearch =
        searchTerm === '' ||
        req.job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [jobRequests, statusFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    return jobRequests.reduce(
      (acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [jobRequests]);

  const handleDeleteClick = useCallback((id: string) => {
    setJobRequestToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!jobRequestToDelete) return;

    try {
      const response = await axios.delete(`/api/job-requests/${jobRequestToDelete}`);

      if (response.status >= 400) throw new Error('Failed to delete job request');

      setJobRequests(jobRequests.filter((req) => req.id !== jobRequestToDelete));
      toast.success('Candidature supprimée avec succès');
    } catch (error) {
      console.error('Error deleting job request:', error);
      toast.error('Erreur lors de la suppression de la candidature');
    } finally {
      setDeleteDialogOpen(false);
      setJobRequestToDelete(null);
    }
  }, [jobRequestToDelete, jobRequests, setJobRequests]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container max-w-screen-xl mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Mes candidatures {session?.user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <Clock className="h-8 w-8 text-amber-500 mr-4" />
            <div>
              <p className="text-lg font-medium">{statusCounts.PENDING || 0}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-lg font-medium">{statusCounts.ACCEPTED || 0}</p>
              <p className="text-sm text-muted-foreground">Acceptées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <XCircle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-lg font-medium">{statusCounts.REJECTED || 0}</p>
              <p className="text-sm text-muted-foreground">Refusées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Liste des candidatures</CardTitle>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Rechercher une offre..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={JOB_REQUEST_STATUS.ALL}
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value={JOB_REQUEST_STATUS.ALL}>Toutes</TabsTrigger>
              <TabsTrigger value={JOB_REQUEST_STATUS.PENDING}>En attente</TabsTrigger>
              <TabsTrigger value={JOB_REQUEST_STATUS.ACCEPTED}>Acceptées</TabsTrigger>
              <TabsTrigger value={JOB_REQUEST_STATUS.REJECTED}>Refusées</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {filteredJobRequests.length > 0 ? (
                filteredJobRequests.map((jobRequest) => (
                  <Card key={jobRequest.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{jobRequest.job.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {jobRequest.job.company.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <JobRequestStatusBadge status={jobRequest.status} />
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`/jobs/${jobRequest.jobId}`}
                              className="flex items-center gap-2"
                            >
                              Voir l&apos;offre
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(jobRequest.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Demande envoyée le{' '}
                          {format(new Date(jobRequest.createdAt), 'dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                        {jobRequest.updatedAt !== jobRequest.createdAt && (
                          <span>
                            Mise à jour le{' '}
                            {format(new Date(jobRequest.updatedAt), 'dd MMMM yyyy', {
                              locale: fr,
                            })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune candidature trouvée</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/jobs">Découvrir les offres d&apos;emploi</Link>
                  </Button>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action ne peut pas être
              annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

const StudentDashboardPage = React.memo(StudentDashboardPageComponent);

export default StudentDashboardPage;
