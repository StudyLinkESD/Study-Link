'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useStudentApplications } from '@/hooks/students/dashboard/useStudentApplications';
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
import { APPLICATION_STATUS } from '@/constants/status';
import axios from 'axios';

// Composant pour afficher le badge de statut, extrait pour plus de clarté
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

  // Filtrage des applications mémorisé
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

  // Calcul des compteurs de statut mémorisé
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

  // État de chargement
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
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{application.job.name}</h3>
                          <p className="text-sm text-muted-foreground">
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
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(application.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
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

// Mémorisation du composant pour éviter les rendus inutiles
const StudentDashboardPage = React.memo(StudentDashboardPageComponent);

export default StudentDashboardPage;
