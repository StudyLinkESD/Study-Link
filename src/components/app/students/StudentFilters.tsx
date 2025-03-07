import React from 'react';

import FilterSelector from '@/components/app/common/FilterSelector';
import SearchBar from '@/components/app/common/SearchBar';
import { Label } from '@/components/ui/label';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

import { STUDENT_STATUS } from '@/constants/status';

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
    const currentStatus = state.statusFilter;
    dispatch({ type: 'RESET_FILTERS' });
    dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
  }, [dispatch, state.statusFilter]);

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
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
        <TabsList>
          <TabsTrigger value={STUDENT_STATUS.ALL}>Tous</TabsTrigger>
          <TabsTrigger value={STUDENT_STATUS.ALTERNANT}>Alternants</TabsTrigger>
          <TabsTrigger value={STUDENT_STATUS.STAGIAIRE}>Stagiaires</TabsTrigger>
        </TabsList>

        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher..."
          initialValue={state.searchTerm}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="mb-4 flex flex-col gap-5">
        <Label className="block" htmlFor="skills-filter">
          Filtrer par compétences
        </Label>

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

const StudentFilters = React.memo(StudentFiltersComponent);

export default StudentFilters;
export { STUDENT_STATUS };
