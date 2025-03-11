'use client';

import { Prisma } from '@prisma/client';

import React, { useMemo, useReducer, useRef } from 'react';

import ItemGrid from '@/components/app/common/ItemGrid';
import SearchBar from '@/components/app/common/SearchBar';
import JobApplicationCard from '@/components/app/students/dashboard/JobApplicationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { JobRequestFull } from '@/types/request_status.type';

type JobApplicationFull = JobRequestFull;

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

const transformToJobApplicationFull = (app: JobRequestWithRelations): JobApplicationFull => ({
  id: app.id,
  studentId: app.studentId,
  jobId: app.jobId,
  status: app.status,
  subject: app.subject,
  message: app.message,
  createdAt: app.createdAt.toISOString(),
  updatedAt: app.updatedAt.toISOString(),
  student: {
    id: app.student.id,
    userId: app.student.userId,
    user: {
      id: app.student.user.id,
      createdAt: app.student.user.createdAt,
      updatedAt: app.student.user.updatedAt,
      deletedAt: app.student.user.deletedAt,
      email: app.student.user.email,
      firstName: app.student.user.firstName,
      lastName: app.student.user.lastName,
      profilePicture: app.student.user.profilePicture,
      emailVerified: app.student.user.emailVerified,
    },
  },
  job: {
    id: app.job.id,
    name: app.job.name,
    companyId: app.job.companyId,
    company: {
      name: app.job.company.name,
      logo: app.job.company.logo,
    },
  },
});

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
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher une candidature..."
          initialValue={state.searchTerm}
          className="w-full md:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
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

            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentApplications}
                renderItem={(app) => (
                  <JobApplicationCard
                    application={transformToJobApplicationFull(app)}
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
                    application={transformToJobApplicationFull(app)}
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
                    application={transformToJobApplicationFull(app)}
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
                    application={transformToJobApplicationFull(app)}
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
    </div>
  );
}
