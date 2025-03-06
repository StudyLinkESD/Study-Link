'use client';

import React, { useState } from 'react';
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

const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const { applications, setApplications, isLoading } = useStudentApplications(session);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_OPTIONS.ALL);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === STATUS_OPTIONS.ALL || app.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      app.job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <StatusBadge status="En attente" variant="default" />;
      case 'ACCEPTED':
        return <StatusBadge status="Acceptée" variant="success" />;
      case 'REJECTED':
        return <StatusBadge status="Refusée" className="bg-red-200 text-red-800" />;
      default:
        return <StatusBadge status="Inconnu" variant="outline" />;
    }
  };

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      const response = await fetch(`/api/job-requests/${applicationToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete application');

      setApplications(applications.filter((app) => app.id !== applicationToDelete));
      toast.success('Candidature supprimée avec succès');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Erreur lors de la suppression de la candidature');
    } finally {
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  return (
    <main className="container max-w-screen-xl mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Mes candidatures {session?.user.name}</h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Chargement de vos candidatures...</p>
          </div>
        </div>
      ) : (
        <>
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
                defaultValue={STATUS_OPTIONS.ALL}
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full"
              >
                <TabsList className="mb-6">
                  <TabsTrigger value={STATUS_OPTIONS.ALL}>Toutes</TabsTrigger>
                  <TabsTrigger value={STATUS_OPTIONS.PENDING}>En attente</TabsTrigger>
                  <TabsTrigger value={STATUS_OPTIONS.ACCEPTED}>Acceptées</TabsTrigger>
                  <TabsTrigger value={STATUS_OPTIONS.REJECTED}>Refusées</TabsTrigger>
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
                              {getStatusBadge(application.status)}
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
        </>
      )}
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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
