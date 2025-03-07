'use client';

import React, { useReducer, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/app/common/SearchBar';
import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import JobApplicationCard from '@/components/app/dashboard/JobApplicationCard';
import { useJobApplication } from '@/context/job-application.context';
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
import { toast } from 'sonner';
import { JobApplicationFull } from '@/types/application_status.type';

const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

const APPLICATIONS_PER_PAGE = 9;

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

function ApplicationFilters({
  state,
  dispatch,
  applicationCount,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  applicationCount: number;
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
            {applicationCount} candidature{applicationCount !== 1 ? 's' : ''}
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

export interface JobApplicationsListProps {
  applications: JobApplicationFull[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplicationFull[]>>;
}

export default function JobApplicationsList({
  applications,
  setApplications,
}: JobApplicationsListProps) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);
  const { selectedApplication, setSelectedApplication } = useJobApplication();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [applicationToDelete, setApplicationToDelete] = React.useState<string | null>(null);

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== STATUS_OPTIONS.ALL) {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          (app.student.user.firstName?.toLowerCase() ?? '').includes(searchLower) ||
          (app.student.user.lastName?.toLowerCase() ?? '').includes(searchLower) ||
          app.job.name.toLowerCase().includes(searchLower) ||
          app.job.company.name.toLowerCase().includes(searchLower),
      );
    }

    return result;
  }, [statusFilter, searchTerm, applications]);

  const totalPages = Math.ceil(filteredApplications.length / APPLICATIONS_PER_PAGE);
  const currentApplications = useMemo(() => {
    const indexOfLastItem = currentPage * APPLICATIONS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - APPLICATIONS_PER_PAGE;
    return filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredApplications, currentPage]);

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

      if (selectedApplication?.id === applicationToDelete) {
        setSelectedApplication(null);
      }

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
            <ApplicationFilters
              state={state}
              dispatch={dispatch}
              applicationCount={filteredApplications.length}
            />

            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentApplications}
                renderItem={(app) => (
                  <JobApplicationCard
                    application={app}
                    onDeleteClick={() => handleDeleteClick(app.id)}
                  />
                )}
                keyExtractor={(app) => app.id}
                emptyState={{
                  title: 'Aucune candidature trouvée',
                  description: 'Aucune candidature ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>

            <TabsContent value={STATUS_OPTIONS.PENDING} className="mt-0">
              <ItemGrid
                items={currentApplications}
                renderItem={(app) => (
                  <JobApplicationCard
                    application={app}
                    onDeleteClick={() => handleDeleteClick(app.id)}
                  />
                )}
                keyExtractor={(app) => app.id}
                emptyState={{
                  title: 'Aucune candidature en attente',
                  description: 'Aucune candidature en attente ne correspond à vos critères.',
                }}
              />
            </TabsContent>

            <TabsContent value={STATUS_OPTIONS.ACCEPTED} className="mt-0">
              <ItemGrid
                items={currentApplications}
                renderItem={(app) => (
                  <JobApplicationCard
                    application={app}
                    onDeleteClick={() => handleDeleteClick(app.id)}
                  />
                )}
                keyExtractor={(app) => app.id}
                emptyState={{
                  title: 'Aucune candidature acceptée',
                  description: 'Aucune candidature acceptée ne correspond à vos critères.',
                }}
              />
            </TabsContent>

            <TabsContent value={STATUS_OPTIONS.REJECTED} className="mt-0">
              <ItemGrid
                items={currentApplications}
                renderItem={(app) => (
                  <JobApplicationCard
                    application={app}
                    onDeleteClick={() => handleDeleteClick(app.id)}
                  />
                )}
                keyExtractor={(app) => app.id}
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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
