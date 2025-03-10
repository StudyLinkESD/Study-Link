'use client';

import axios from 'axios';
import { toast } from 'sonner';

import React, { useMemo, useReducer, useRef } from 'react';

import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import SearchBar from '@/components/app/common/SearchBar';
import JobRequestCard from '@/components/app/dashboard/JobRequestCard';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { JobRequestFull } from '@/types/request_status.type';

import { useJobRequest } from '@/context/job-request.context';

const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

const REQUESTS_PER_PAGE = 9;

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

export interface JobRequestsListProps {
  requests: JobRequestFull[];
  setRequests: React.Dispatch<React.SetStateAction<JobRequestFull[]>>;
}

export default function JobRequestsList({ requests, setRequests }: JobRequestsListProps) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);
  const { selectedRequest, setSelectedRequest } = useJobRequest();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [requestToDelete, setRequestToDelete] = React.useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== STATUS_OPTIONS.ALL) {
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
  }, [statusFilter, searchTerm, requests]);

  const totalPages = Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE);
  const currentRequests = useMemo(() => {
    const indexOfLastItem = currentPage * REQUESTS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - REQUESTS_PER_PAGE;
    return filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredRequests, currentPage]);

  const handleDeleteClick = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;

    try {
      const response = await axios.delete(`/api/students/job-requests/${requestToDelete}`);

      if (response.status >= 400) throw new Error('Failed to delete request');

      setRequests(requests.filter((req) => req.id !== requestToDelete));

      if (selectedRequest?.id === requestToDelete) {
        setSelectedRequest(null);
      }

      toast.success('Candidature supprimée avec succès');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Erreur lors de la suppression de la candidature');
    } finally {
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
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
                  <JobRequestCard request={req} onDeleteClick={() => handleDeleteClick(req.id)} />
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
                  <JobRequestCard request={req} onDeleteClick={() => handleDeleteClick(req.id)} />
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
                  <JobRequestCard request={req} onDeleteClick={() => handleDeleteClick(req.id)} />
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
                  <JobRequestCard request={req} onDeleteClick={() => handleDeleteClick(req.id)} />
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
    </div>
  );
}
