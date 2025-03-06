import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import SearchBar from '@/components/app/common/SearchBar';
import FilterSelector from '@/components/app/common/FilterSelector';
import { STUDENT_STATUS } from '@/constants/status';

// Types exportés pour être partagés
export type FilterState = {
  statusFilter: string;
  searchTerm: string;
  selectedSkills: string[];
  currentPage: number;
};

export type FilterAction =
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' };

type StudentFiltersProps = {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  allSkills: string[];
};

function StudentFiltersComponent({ state, dispatch, allSkills }: StudentFiltersProps) {
  const { selectedSkills } = state;

  // Fonctions de gestion des skills mémorisées
  const handleSelectSkill = React.useCallback(
    (skill: string) => {
      dispatch({ type: 'ADD_SKILL', payload: skill });
    },
    [dispatch],
  );

  const handleRemoveSkill = React.useCallback(
    (skill: string) => {
      dispatch({ type: 'REMOVE_SKILL', payload: skill });
    },
    [dispatch],
  );

  const resetFilters = React.useCallback(() => {
    // Récupérer le statut actuel avant la réinitialisation
    const currentStatus = state.statusFilter;

    // Réinitialiser tous les filtres
    dispatch({ type: 'RESET_FILTERS' });

    // Rétablir le statut d'onglet précédent
    dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
  }, [dispatch, state.statusFilter]);

  // Convertir les skills en options pour le FilterSelector
  const skillOptions = React.useMemo(
    () =>
      allSkills.map((skill) => ({
        value: skill,
        label: skill,
      })),
    [allSkills],
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <TabsList>
          <TabsTrigger value={STUDENT_STATUS.ALL}>Tous</TabsTrigger>
          <TabsTrigger value={STUDENT_STATUS.ALTERNANT}>Alternants</TabsTrigger>
          <TabsTrigger value={STUDENT_STATUS.STAGIAIRE}>Stagiaires</TabsTrigger>
        </TabsList>

        {/* Utilisation du composant SearchBar */}
        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher..."
          initialValue={state.searchTerm}
          className="w-full sm:max-w-xs"
        />
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

// Mémorisation du composant pour éviter les rendus inutiles
const StudentFilters = React.memo(StudentFiltersComponent);

export default StudentFilters;
export { STUDENT_STATUS };
