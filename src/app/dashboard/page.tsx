'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/app/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JobApplicationsResponse {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    name: string;
    companyId: string;
    company: {
      name: string;
      logoId: string | null;
    };
  };
}

// Données factices pour les tests
const mockApplications: JobApplicationsResponse[] = [
  {
    id: '1a2b3c4d',
    studentId: 'stud1',
    jobId: 'job1',
    status: 'PENDING',
    createdAt: '2025-01-15T14:30:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    job: {
      id: 'job1',
      name: 'Développeur Frontend React',
      companyId: 'comp1',
      company: {
        name: 'TechInnovate',
        logoId: null,
      },
    },
  },
  {
    id: '2e3f4g5h',
    studentId: 'stud1',
    jobId: 'job2',
    status: 'ACCEPTED',
    createdAt: '2025-02-03T09:15:00Z',
    updatedAt: '2025-02-10T16:45:00Z',
    job: {
      id: 'job2',
      name: 'Data Analyst',
      companyId: 'comp2',
      company: {
        name: 'DataViz Corp',
        logoId: 'logo1',
      },
    },
  },
  {
    id: '3i4j5k6l',
    studentId: 'stud1',
    jobId: 'job3',
    status: 'REJECTED',
    createdAt: '2025-01-20T11:20:00Z',
    updatedAt: '2025-01-28T13:10:00Z',
    job: {
      id: 'job3',
      name: 'UX Designer',
      companyId: 'comp3',
      company: {
        name: 'DesignHub',
        logoId: 'logo2',
      },
    },
  },
];

const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<JobApplicationsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_OPTIONS.ALL);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (session?.user?.id) {
          // Récupérer l'ID de l'étudiant à partir de l'ID de l'utilisateur
          const studentResponse = await fetch(`/api/students?userId=${session.user.id}`);
          if (!studentResponse.ok) throw new Error('Failed to fetch student data');

          const studentData = await studentResponse.json();
          if (studentData.length > 0) {
            const studentId = studentData[0].id;

            // Récupérer les candidatures de l'étudiant
            const applicationsResponse = await fetch(`/api/job-requests?studentId=${studentId}`);
            if (!applicationsResponse.ok) throw new Error('Failed to fetch job applications');

            const applicationsData = await applicationsResponse.json();
            setApplications(applicationsData);
          }
        }
      } catch (error) {
        console.error('Error fetching student applications:', error);
        // Utilisation des données factices en cas d'erreur
        setApplications(mockApplications);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchApplications();
    } else {
      // Pour le développement, utiliser les données factices
      const timer = setTimeout(() => {
        setApplications(mockApplications);
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  // Filtrage des candidatures selon le statut et la recherche
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === STATUS_OPTIONS.ALL || app.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      app.job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Comptage des statuts pour les badges
  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

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

  return (
    <main className="container max-w-screen-xl mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Mes candidatures</h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Chargement de vos candidatures...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Résumé des candidatures */}
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

          {/* Liste des candidatures avec filtres */}
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
                  <TabsTrigger value={STATUS_OPTIONS.ALL}>
                    Toutes ({applications.length})
                  </TabsTrigger>
                  <TabsTrigger value={STATUS_OPTIONS.PENDING}>
                    En attente ({statusCounts.PENDING || 0})
                  </TabsTrigger>
                  <TabsTrigger value={STATUS_OPTIONS.ACCEPTED}>
                    Acceptées ({statusCounts.ACCEPTED || 0})
                  </TabsTrigger>
                  <TabsTrigger value={STATUS_OPTIONS.REJECTED}>
                    Refusées ({statusCounts.REJECTED || 0})
                  </TabsTrigger>
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
                                  Voir l'offre
                                  <ExternalLink className="h-4 w-4" />
                                </a>
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
                        <a href="/jobs">Découvrir les offres d'emploi</a>
                      </Button>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
