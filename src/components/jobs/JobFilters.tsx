'use client';

import React from 'react';

import FilterSelector from '@/components/app/common/FilterSelector';
import SearchBar from '@/components/app/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

import { FilterAction, FilterState } from '@/types/jobs';

interface JobFiltersProps {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  allSkills: string[];
  jobsCount: number;
  statusOptions: {
    ALL: string;
    ALTERNANT: string;
    STAGIAIRE: string;
  };
}

export function JobFilters({
  state,
  dispatch,
  allSkills,
  jobsCount,
  statusOptions,
}: JobFiltersProps) {
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
          placeholder="Rechercher une offre..."
          initialValue={state.searchTerm}
          className="w-full md:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {jobsCount} offre{jobsCount !== 1 ? 's' : ''}
          </span>
          {(state.searchTerm || state.selectedSkills.length > 0) && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <TabsList className="mb-6">
        <TabsTrigger value={statusOptions.ALL}>Tous</TabsTrigger>
        <TabsTrigger value={statusOptions.ALTERNANT}>Alternance</TabsTrigger>
        <TabsTrigger value={statusOptions.STAGIAIRE}>Stage</TabsTrigger>
      </TabsList>

      {allSkills.length > 0 && (
        <div className="mb-6">
          <Label className="mb-2 block">Filtrer par compétences</Label>
          <div className="flex flex-wrap gap-2">
            <FilterSelector
              options={allSkills.map((skill) => ({ value: skill, label: skill }))}
              selectedValues={state.selectedSkills}
              onSelect={(skill) => dispatch({ type: 'ADD_SKILL', payload: skill })}
              onRemove={(skill) => dispatch({ type: 'REMOVE_SKILL', payload: skill })}
            />
          </div>
        </div>
      )}
    </>
  );
}
