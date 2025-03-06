'use client';

import React, { useReducer, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/app/common/SearchBar';
import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import JobApplicationCard from '@/components/app/students/dashboard/JobApplicationCard';
import { Prisma } from '@prisma/client';

// Add this type using Prisma's generated types
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

// Composant pour les filtres
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

export default function JobApplicationsList({
  applications,
}: {
  applications: JobRequestWithRelations[];
  setApplications: React.Dispatch<React.SetStateAction<JobRequestWithRelations[]>>;
}) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [, setDeleteDialogOpen] = React.useState(false);
  const [, setApplicationToDelete] = React.useState<string | null>(null);

  // Logique de filtrage
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== STATUS_OPTIONS.ALL) {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.student.user.firstname.toLowerCase().includes(searchLower) ||
          app.student.user.lastname.toLowerCase().includes(searchLower) ||
          app.job.name.toLowerCase().includes(searchLower) ||
          app.job.company.name.toLowerCase().includes(searchLower),
      );
    }

    return result;
  }, [statusFilter, searchTerm, applications]);

  // Calcul de la pagination
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

            {/* Contenu des onglets */}
            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentApplications}
                renderItem={(app) => (
                  <JobApplicationCard
                    application={{
                      ...app,
                      createdAt: app.createdAt.toISOString(),
                      updatedAt: app.updatedAt.toISOString(),
                    }}
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
                    application={{
                      ...app,
                      createdAt: app.createdAt.toISOString(),
                      updatedAt: app.updatedAt.toISOString(),
                    }}
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
                    application={{
                      ...app,
                      createdAt: app.createdAt.toISOString(),
                      updatedAt: app.updatedAt.toISOString(),
                    }}
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
                    application={{
                      ...app,
                      createdAt: app.createdAt.toISOString(),
                      updatedAt: app.updatedAt.toISOString(),
                    }}
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

      {/* Composant de pagination */}
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
