'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

import Link from 'next/link';
import { useEffect, useReducer, useRef, useState } from 'react';

import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import SearchBar from '@/components/app/common/SearchBar';
import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { JobRequestWithRelations, useCompanyJobRequests } from '@/hooks/useCompanyJobRequests';

const REQUESTS_PER_PAGE = 6;
const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

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
  statusFilter: STATUS_OPTIONS.ALL,
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

function RequestFilters({
  state,
  dispatch,
  requestCount,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  requestCount: number;
}) {
  const resetFilters = () => {
    const currentStatus = state.statusFilter;
    dispatch({ type: 'RESET_FILTERS' });
    dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
  };

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher une candidature..."
          initialValue={state.searchTerm}
          className="w-full md:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {requestCount} candidature{requestCount !== 1 ? 's' : ''}
          </span>
          {state.searchTerm && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <TabsList className="mb-6">
        <TabsTrigger value={STATUS_OPTIONS.ALL}>Tous</TabsTrigger>
        <TabsTrigger value={STATUS_OPTIONS.PENDING}>En attente</TabsTrigger>
        <TabsTrigger value={STATUS_OPTIONS.ACCEPTED}>Acceptée</TabsTrigger>
        <TabsTrigger value={STATUS_OPTIONS.REJECTED}>Rejetée</TabsTrigger>
      </TabsList>
    </>
  );
}

function JobRequestCard({
  request,
  onStatusChange,
  onClick,
}: {
  request: JobRequestWithRelations;
  onStatusChange: (id: string, status: string) => void;
  onClick?: (request: JobRequestWithRelations) => void;
}) {
  const { student, job, status, createdAt, id } = request;
  const { firstName, lastName } = student.user;

  const formattedDate = format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REJECTED':
        return 'Rejetée';
      default:
        return status;
    }
  };

  return (
    <Card className="cursor-pointer overflow-hidden" onClick={() => onClick && onClick(request)}>
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
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={getStatusLabel(status)} />
          <span className="text-muted-foreground text-xs">{formattedDate}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Select defaultValue={status} onValueChange={(value) => onStatusChange(id, value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Changer le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="ACCEPTED">Accepter</SelectItem>
              <SelectItem value="REJECTED">Rejeter</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/students/${student.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Voir profil
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentsJobsRequestsList() {
  const { data: session } = useSession();
  const { requests, isLoading, updateRequestStatus, companyId } = useCompanyJobRequests(session);

  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);

  useEffect(() => {
    const handleJobSelected = (event: CustomEvent<{ jobId: string; jobTitle: string }>) => {
      setSelectedJobId(event.detail.jobId);
      setSelectedJobTitle(event.detail.jobTitle);

      const currentStatus = state.statusFilter;
      dispatch({ type: 'RESET_FILTERS' });
      dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
    };

    window.addEventListener('job-selected', handleJobSelected as EventListener);

    return () => {
      window.removeEventListener('job-selected', handleJobSelected as EventListener);
    };
  }, [state.statusFilter]);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    await updateRequestStatus(requestId, newStatus);
  };

  const filteredRequests = requests.filter((request) => {
    if (selectedJobId && request.jobId !== selectedJobId) {
      return false;
    }

    if (statusFilter !== STATUS_OPTIONS.ALL && request.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const studentName =
        `${request.student.user.firstName} ${request.student.user.lastName}`.toLowerCase();
      const jobName = request.job.name.toLowerCase();

      if (!studentName.includes(searchLower) && !jobName.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE);
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * REQUESTS_PER_PAGE,
    currentPage * REQUESTS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
          <p>Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-lg font-medium">Vous n&apos;êtes pas associé à une entreprise</p>
          <p className="text-muted-foreground">
            Veuillez contacter un administrateur pour associer votre compte à une entreprise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="students-jobs-requests" className="w-1/3 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {selectedJobTitle ? `Candidatures pour : ${selectedJobTitle}` : 'Candidatures reçues'}
        </h2>
        {selectedJobId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedJobId(null);
              setSelectedJobTitle(null);
              window.dispatchEvent(new CustomEvent('reset-selected-job'));
            }}
          >
            Voir toutes les candidatures
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs
            ref={tabsRef}
            defaultValue={STATUS_OPTIONS.ALL}
            value={statusFilter}
            className="w-full"
            onValueChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', payload: value })}
          >
            <RequestFilters
              state={state}
              dispatch={dispatch}
              requestCount={filteredRequests.length}
            />

            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentRequests}
                renderItem={(req) => (
                  <JobRequestCard request={req} onStatusChange={handleStatusChange} />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature trouvée',
                  description: 'Aucune candidature ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>

            <TabsContent value={STATUS_OPTIONS.PENDING} className="mt-0">
              <ItemGrid
                items={currentRequests}
                renderItem={(req) => (
                  <JobRequestCard request={req} onStatusChange={handleStatusChange} />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature en attente',
                  description: 'Aucune candidature en attente ne correspond à vos critères.',
                }}
              />
            </TabsContent>

            <TabsContent value={STATUS_OPTIONS.ACCEPTED} className="mt-0">
              <ItemGrid
                items={currentRequests}
                renderItem={(req) => (
                  <JobRequestCard request={req} onStatusChange={handleStatusChange} />
                )}
                keyExtractor={(req) => req.id}
                emptyState={{
                  title: 'Aucune candidature acceptée',
                  description: 'Aucune candidature acceptée ne correspond à vos critères.',
                }}
              />
            </TabsContent>

            <TabsContent value={STATUS_OPTIONS.REJECTED} className="mt-0">
              <ItemGrid
                items={currentRequests}
                renderItem={(req) => (
                  <JobRequestCard request={req} onStatusChange={handleStatusChange} />
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => dispatch({ type: 'SET_PAGE', payload: page })}
        />
      )}
    </div>
  );
}
