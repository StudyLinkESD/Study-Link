'use client';

import React, { useReducer, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/app/common/SearchBar';
import ItemGrid from '@/components/app/common/ItemGrid';
import JobRequestCard from '@/components/app/students/dashboard/JobRequestCard';
import { Prisma } from '@prisma/client';
import { JobRequestFull } from '@/types/job-request.type';
import { JOB_REQUEST_STATUS } from '@/constants/status';

type JobRequestWithRelations = Prisma.JobRequestGetPayload<{
  include: {
    student: {
      include: {
        user: true;
      };
    };
    job: {
      include: {
        company: true;
      };
    };
  };
}>;

const transformToJobRequestFull = (req: JobRequestWithRelations): JobRequestFull => ({
  id: req.id,
  studentId: req.studentId,
  jobId: req.jobId,
  status: req.status,
  createdAt: req.createdAt.toISOString(),
  updatedAt: req.updatedAt.toISOString(),
  student: {
    id: req.student.id,
    userId: req.student.userId,
    user: {
      id: req.student.user.id,
      createdAt: req.student.user.createdAt,
      updatedAt: req.student.user.updatedAt,
      deletedAt: req.student.user.deletedAt,
      email: req.student.user.email,
      firstName: req.student.user.firstName,
      lastName: req.student.user.lastName,
      profilePicture: req.student.user.profilePicture,
      emailVerified: req.student.user.emailVerified,
    },
  },
  job: {
    id: req.job.id,
    name: req.job.name,
    companyId: req.job.companyId,
    company: {
      name: req.job.company.name,
      logo: req.job.company.logo,
    },
  },
});

const JOB_REQUESTS_PER_PAGE = 9;

type FilterState = {
  statusFilter: string;
  searchTerm: string;
  currentPage: number;
};

type FilterAction =
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' };

const initialFilterState: FilterState = {
  statusFilter: JOB_REQUEST_STATUS.ALL,
  searchTerm: '',
  currentPage: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'RESET_FILTERS':
      return { ...initialFilterState, statusFilter: state.statusFilter };
    default:
      return state;
  }
}

function JobRequestFilters({
  state,
  dispatch,
  jobRequestCount,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  jobRequestCount: number;
}) {
  const resetFilters = () => {
    const currentStatus = state.statusFilter;
    dispatch({ type: 'RESET_FILTERS' });
    dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher une candidature..."
          initialValue={state.searchTerm}
          className="w-full md:max-w-xs"
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">
            {jobRequestCount} candidature{jobRequestCount !== 1 ? 's' : ''}
          </span>
          {state.searchTerm && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <TabsList className="mb-6">
        <TabsTrigger value={JOB_REQUEST_STATUS.ALL}>Tous</TabsTrigger>
        <TabsTrigger value={JOB_REQUEST_STATUS.PENDING}>En attente</TabsTrigger>
        <TabsTrigger value={JOB_REQUEST_STATUS.ACCEPTED}>Acceptée</TabsTrigger>
        <TabsTrigger value={JOB_REQUEST_STATUS.REJECTED}>Rejetée</TabsTrigger>
      </TabsList>
    </>
  );
}

export default function JobRequestsList({
  jobRequests,
  setJobRequests,
}: {
  jobRequests: JobRequestWithRelations[];
  setJobRequests: React.Dispatch<React.SetStateAction<JobRequestWithRelations[]>>;
}) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [jobRequestToDelete, setJobRequestToDelete] = React.useState<string | null>(null);

  const filteredJobRequests = useMemo(() => {
    let result = [...jobRequests];

    if (statusFilter !== JOB_REQUEST_STATUS.ALL) {
      result = result.filter((req) => req.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (req) =>
          (req.student.user.firstName?.toLowerCase() ?? '').includes(searchLower) ||
          (req.student.user.lastName?.toLowerCase() ?? '').includes(searchLower) ||
          req.job.name.toLowerCase().includes(searchLower) ||
          req.job.company.name.toLowerCase().includes(searchLower),
      );
    }

    return result;
  }, [statusFilter, searchTerm, jobRequests]);

  const currentJobRequests = useMemo(() => {
    const indexOfLastItem = currentPage * JOB_REQUESTS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - JOB_REQUESTS_PER_PAGE;
    return filteredJobRequests.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredJobRequests, currentPage]);

  const handleDeleteClick = (id: string) => {
    setJobRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobRequestToDelete) return;

    try {
      // Appel API pour supprimer la candidature
      // await axios.delete(`/api/job-requests/${jobRequestToDelete}`);

      // Mise à jour de l'état local
      setJobRequests(jobRequests.filter((req) => req.id !== jobRequestToDelete));
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
    } finally {
      setDeleteDialogOpen(false);
      setJobRequestToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Tabs
            ref={tabsRef}
            defaultValue={JOB_REQUEST_STATUS.ALL}
            value={statusFilter}
            className="w-full"
            onValueChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', payload: value })}
          >
            <JobRequestFilters
              state={state}
              dispatch={dispatch}
              jobRequestCount={filteredJobRequests.length}
            />

            <TabsContent value={JOB_REQUEST_STATUS.ALL} className="mt-0">
              <ItemGrid
                items={currentJobRequests}
                renderItem={(req) => (
                  <JobRequestCard
                    jobRequest={transformToJobRequestFull(req)}
                    onDeleteClick={() => handleDeleteClick(req.id)}
                  />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature trouvée',
                  description: 'Aucune candidature ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>

            <TabsContent value={JOB_REQUEST_STATUS.PENDING} className="mt-0">
              <ItemGrid
                items={currentJobRequests}
                renderItem={(req) => (
                  <JobRequestCard
                    jobRequest={transformToJobRequestFull(req)}
                    onDeleteClick={() => handleDeleteClick(req.id)}
                  />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature en attente',
                  description: 'Aucune candidature en attente ne correspond à vos critères.',
                }}
              />
            </TabsContent>

            <TabsContent value={JOB_REQUEST_STATUS.ACCEPTED} className="mt-0">
              <ItemGrid
                items={currentJobRequests}
                renderItem={(req) => (
                  <JobRequestCard
                    jobRequest={transformToJobRequestFull(req)}
                    onDeleteClick={() => handleDeleteClick(req.id)}
                  />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature acceptée',
                  description: 'Aucune candidature acceptée ne correspond à vos critères.',
                }}
              />
            </TabsContent>

            <TabsContent value={JOB_REQUEST_STATUS.REJECTED} className="mt-0">
              <ItemGrid
                items={currentJobRequests}
                renderItem={(req) => (
                  <JobRequestCard
                    jobRequest={transformToJobRequestFull(req)}
                    onDeleteClick={() => handleDeleteClick(req.id)}
                  />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature rejetée',
                  description: 'Aucune candidature rejetée ne correspond à vos critères.',
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ajouter ici un Dialog de confirmation pour la suppression */}
    </div>
  );
}
