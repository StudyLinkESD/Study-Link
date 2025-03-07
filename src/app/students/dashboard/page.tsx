'use client';

import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, Clock, ExternalLink, Loader2, Trash2, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';

import StatusBadge from '@/components/app/common/StatusBadge';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useStudentApplications } from '@/hooks/students/dashboard/useStudentApplications';

import { APPLICATION_STATUS } from '@/constants/status';

const ApplicationStatusBadge = React.memo(({ status }: { status: string }) => {
  switch (status) {
    case APPLICATION_STATUS.PENDING:
      return <StatusBadge status="En attente" variant="default" />;
    case APPLICATION_STATUS.ACCEPTED:
      return <StatusBadge status="Acceptée" variant="success" />;
    case APPLICATION_STATUS.REJECTED:
      return <StatusBadge status="Refusée" className="bg-red-200 text-red-800" />;
    default:
      return <StatusBadge status="Inconnu" variant="outline" />;
  }
});

ApplicationStatusBadge.displayName = 'ApplicationStatusBadge';

function StudentDashboardPageComponent() {
  const { data: session } = useSession();
  const { applications, setApplications, isLoading } = useStudentApplications(session);
  const [statusFilter, setStatusFilter] = useState<string>(APPLICATION_STATUS.ALL);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === APPLICATION_STATUS.ALL || app.status === statusFilter;
      const matchesSearch =
        searchTerm === '' ||
        app.job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [applications]);

  const handleDeleteClick = useCallback((id: string) => {
    setApplicationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!applicationToDelete) return;

    try {
      const response = await axios.delete(`/api/job-requests/${applicationToDelete}`);

      if (response.status >= 400) throw new Error('Failed to delete application');

      setApplications(applications.filter((app) => app.id !== applicationToDelete));
      toast.success('Candidature supprimée avec succès');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Erreur lors de la suppression de la candidature');
    } finally {
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  }, [applicationToDelete, applications, setApplications]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
          <p>Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-screen-xl px-4 py-6 md:px-6">
      <h1 className="mb-6 text-3xl font-bold">Mes candidatures {session?.user.name}</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="mr-4 h-8 w-8 text-amber-500" />
            <div>
              <p className="text-lg font-medium">{statusCounts.PENDING || 0}</p>
              <p className="text-muted-foreground text-sm">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="mr-4 h-8 w-8 text-green-500" />
            <div>
              <p className="text-lg font-medium">{statusCounts.ACCEPTED || 0}</p>
              <p className="text-muted-foreground text-sm">Acceptées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="mr-4 h-8 w-8 text-red-500" />
            <div>
              <p className="text-lg font-medium">{statusCounts.REJECTED || 0}</p>
              <p className="text-muted-foreground text-sm">Refusées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Liste des candidatures</CardTitle>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Rechercher une offre..."
                className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={APPLICATION_STATUS.ALL}
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value={APPLICATION_STATUS.ALL}>Toutes</TabsTrigger>
              <TabsTrigger value={APPLICATION_STATUS.PENDING}>En attente</TabsTrigger>
              <TabsTrigger value={APPLICATION_STATUS.ACCEPTED}>Acceptées</TabsTrigger>
              <TabsTrigger value={APPLICATION_STATUS.REJECTED}>Refusées</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{application.job.name}</h3>
                          <p className="text-muted-foreground text-sm">
                            {application.job.company.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <ApplicationStatusBadge status={application.status} />
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`/jobs/${application.jobId}`}
                              className="flex items-center gap-2"
                            >
                              Voir l&apos;offre
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(application.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-4 text-sm">
                        <span>
                          Postuléé le{' '}
                          {format(new Date(application.createdAt), 'dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                        {application.updatedAt !== application.createdAt && (
                          <span>
                            Mise à jour le{' '}
                            {format(new Date(application.updatedAt), 'dd MMMM yyyy', {
                              locale: fr,
                            })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center">
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
