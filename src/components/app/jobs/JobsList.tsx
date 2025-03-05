'use client';

import { useRef, useMemo, useReducer } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Importation des composants communs réutilisables
import SearchBar from '@/components/app/common/SearchBar';
import FilterSelector from '@/components/app/common/FilterSelector';
import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import JobCard, { JobCardProps } from '@/components/app/jobs/JobCard';

// Constantes et types
const JOBS_PER_PAGE = 9;
const STATUS_OPTIONS = {
  ALL: 'all',
  ALTERNANT: 'Alternance',
  STAGIAIRE: 'Stage',
};

type Job = Omit<JobCardProps, 'skills'> & {
  skills: { id: string; name: string }[];
};

type JobsListProps = {
  jobs: Job[];
  title?: string;
  isLoading?: boolean;
};

// Définition de l'état et du reducer
type FilterState = {
  statusFilter: string;
  searchTerm: string;
  selectedSkills: string[];
  currentPage: number;
};

type FilterAction =
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' };

const initialFilterState: FilterState = {
  statusFilter: STATUS_OPTIONS.ALL,
  searchTerm: '',
  selectedSkills: [],
  currentPage: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case 'ADD_SKILL':
      if (!action.payload || state.selectedSkills.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedSkills: [...state.selectedSkills, action.payload],
        currentPage: 1,
      };
    case 'REMOVE_SKILL':
      return {
        ...state,
        selectedSkills: state.selectedSkills.filter((skill) => skill !== action.payload),
        currentPage: 1,
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'RESET_FILTERS':
      return { ...initialFilterState };
    default:
      return state;
  }
}

// Composant pour les filtres extraits
function JobFilters({
  state,
  dispatch,
  allSkills,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  allSkills: string[];
  tabsRef: React.RefObject<HTMLDivElement>;
  jobsCount: number;
}) {
  const { selectedSkills } = state;

  // Fonctions de gestion des skills
  const handleSelectSkill = (skill: string) => {
    dispatch({ type: 'ADD_SKILL', payload: skill });
  };

  const handleRemoveSkill = (skill: string) => {
    dispatch({ type: 'REMOVE_SKILL', payload: skill });
  };

  const resetFilters = () => {
    // Récupérer le statut actuel avant la réinitialisation
    const currentStatus = state.statusFilter;

    // Réinitialiser tous les filtres
    dispatch({ type: 'RESET_FILTERS' });

    // Rétablir le statut d'onglet précédent
    dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
  };

  // Convertir les skills en options pour le FilterSelector
  const skillOptions = allSkills.map((skill) => ({
    value: skill,
    label: skill,
  }));

  return (
    <>
      <div className="flex flex-col justify-between gap-4 mb-6">
        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher..."
          initialValue={state.searchTerm}
          className="w-full sm:max-w-xs"
        />
        <TabsList>
          <TabsTrigger value={STATUS_OPTIONS.ALL}>Tous</TabsTrigger>
          <TabsTrigger value={STATUS_OPTIONS.ALTERNANT}>{STATUS_OPTIONS.ALTERNANT}</TabsTrigger>
          <TabsTrigger value={STATUS_OPTIONS.STAGIAIRE}>{STATUS_OPTIONS.STAGIAIRE}</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex flex-col gap-5 mb-4">
        <Label className="block" htmlFor="skills-filter">
          Filtrer par compétences
        </Label>

        {/* Utilisation du composant FilterSelector */}
        <div className="flex">
          <FilterSelector
            options={skillOptions}
            selectedValues={selectedSkills}
            onSelect={handleSelectSkill}
            onRemove={handleRemoveSkill}
            onReset={resetFilters}
            showResetButton={true}
          />
        </div>
      </div>
    </>
  );
}

// Composant principal de liste d'étudiants
export default function JobsList({
  jobs,
  title = 'Liste des étudiants',
  isLoading = false,
}: JobsListProps) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, selectedSkills, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);

  const allSkills = useMemo(
    () => Array.from(new Set(jobs.flatMap((job) => job.skills.map((s) => s.name)))).sort(),
    [jobs],
  );

  // Logique de filtrage
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (statusFilter !== STATUS_OPTIONS.ALL) {
      result = result.filter((job) => job.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.companyName.toLowerCase().includes(searchLower) ||
          job.offerTitle.toLowerCase().includes(searchLower),
      );
    }

    if (selectedSkills.length > 0) {
      result = result.filter((job) =>
        selectedSkills.every((skill) =>
          job.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase()),
        ),
      );
    }

    return result;
  }, [statusFilter, searchTerm, selectedSkills, jobs]);

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const currentJobs = useMemo(() => {
    const indexOfLastJob = currentPage * JOBS_PER_PAGE;
    const indexOfFirstJob = indexOfLastJob - JOBS_PER_PAGE;
    return filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  }, [filteredJobs, currentPage]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3/6 mx-auto px-4 py-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground" aria-live="polite">
          {`${filteredJobs.length} étudiant${filteredJobs.length !== 1 ? 's' : ''} trouvé${
            filteredJobs.length !== 1 ? 's' : ''
          }`}
        </p>
      </div>

      <Card>
        <CardContent>
          <Tabs
            ref={tabsRef}
            defaultValue={STATUS_OPTIONS.ALL}
            value={statusFilter}
            className="w-full"
            onValueChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', payload: value })}
          >
            <JobFilters
              state={state}
              dispatch={dispatch}
              allSkills={allSkills}
              tabsRef={tabsRef as React.RefObject<HTMLDivElement>}
              jobsCount={filteredJobs.length}
            />

            {/* Contenu des onglets unifié en un seul élément */}
            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => <JobCard {...job} />}
                keyExtractor={(job) => job.id}
                emptyState={{
                  title: 'Aucune offre trouvé',
                  description: 'Aucune offre ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.ALTERNANT} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => <JobCard {...job} />}
                keyExtractor={(job) => job.id}
                emptyState={{
                  title: 'Aucun étudiant trouvé',
                  description: 'Aucun étudiant ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.STAGIAIRE} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => <JobCard {...job} />}
                keyExtractor={(job) => job.id}
                emptyState={{
                  title: 'Aucun étudiant trouvé',
                  description: 'Aucun étudiant ne correspond à vos critères de recherche.',
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
