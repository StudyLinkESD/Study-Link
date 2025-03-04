'use client';

import { useRef, useMemo, useReducer } from 'react';
import StudentCard, { StudentCardProps } from './StudentCard';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

// Nouveaux composants communs
import SearchBar from '@/components/app/common/SearchBar';
import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';

// Définition du composant FilterSelector
type FilterSelectorProps = {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  className?: string;
  showResetButton?: boolean;
};

function FilterSelector({
  options,
  selectedValues,
  onSelect,
  onRemove,
  onReset,
  placeholder = 'Sélectionner...',
  className = '',
  showResetButton = false,
}: FilterSelectorProps) {
  const [selectKey, setSelectKey] = useState(0);

  const availableOptions = options.filter((option) => !selectedValues.includes(option.value));

  const handleValueChange = (value: string) => {
    if (value) {
      onSelect(value);
      setSelectKey((prev) => prev + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 min-h-[38px] max-h-[76px] overflow-y-auto p-1">
          {selectedValues.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">Aucun filtre sélectionné</div>
          ) : (
            selectedValues.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="px-2 py-1 h-[30px] flex items-center"
              >
                {value}
                <button
                  onClick={() => onRemove(value)}
                  className="ml-2 hover:text-destructive"
                  aria-label={`Supprimer le filtre ${value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-row items-center gap-4">
        <Select key={selectKey} onValueChange={handleValueChange} value="">
          <SelectTrigger className="w-full sm:w-[210px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Tous les filtres sont sélectionnés
              </div>
            ) : (
              availableOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {showResetButton && selectedValues.length > 0 && onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            aria-label="Réinitialiser les filtres"
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>
    </div>
  );
}

// Constantes et types (inchangés)
const STUDENTS_PER_PAGE = 9;
const STATUS_OPTIONS = {
  ALL: 'all',
  ALTERNANT: 'Alternant',
  STAGIAIRE: 'Stagiaire',
};

type Student = Omit<StudentCardProps, 'skills'> & {
  skills: { id: string; name: string }[];
};

type StudentListProps = {
  students: Student[];
  title?: string;
  isLoading?: boolean;
};

// Définition de l'état et du reducer (inchangée)
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
  // Logique du reducer inchangée
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

// Composant pour les filtres extraits (refactorisé)
function StudentFilters({
  state,
  dispatch,
  allSkills,
  tabsRef,
  studentsCount,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  allSkills: string[];
  tabsRef: React.RefObject<HTMLDivElement>;
  studentsCount: number;
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
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <TabsList>
          <TabsTrigger value={STATUS_OPTIONS.ALL}>Tous</TabsTrigger>
          <TabsTrigger value={STATUS_OPTIONS.ALTERNANT}>Alternants</TabsTrigger>
          <TabsTrigger value={STATUS_OPTIONS.STAGIAIRE}>Stagiaires</TabsTrigger>
        </TabsList>

        {/* Utilisation du nouveau composant SearchBar */}
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
        <div className="flex ">
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

export default function StudentList({
  students,
  title = 'Liste des étudiants',
  isLoading = false,
}: StudentListProps) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, selectedSkills, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);

  const allSkills = useMemo(
    () =>
      Array.from(new Set(students.flatMap((student) => student.skills.map((s) => s.name)))).sort(),
    [students],
  );

  // Logique de filtrage (inchangée)
  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (statusFilter !== STATUS_OPTIONS.ALL) {
      result = result.filter((student) => student.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchLower) ||
          student.lastName.toLowerCase().includes(searchLower) ||
          (student.school && student.school.toLowerCase().includes(searchLower)),
      );
    }

    if (selectedSkills.length > 0) {
      result = result.filter((student) =>
        selectedSkills.every((skill) =>
          student.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase()),
        ),
      );
    }

    return result;
  }, [statusFilter, searchTerm, selectedSkills, students]);

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const currentStudents = useMemo(() => {
    const indexOfLastStudent = currentPage * STUDENTS_PER_PAGE;
    const indexOfFirstStudent = indexOfLastStudent - STUDENTS_PER_PAGE;
    return filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  }, [filteredStudents, currentPage]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground" aria-live="polite">
          {`${filteredStudents.length} étudiant${filteredStudents.length !== 1 ? 's' : ''} trouvé${
            filteredStudents.length !== 1 ? 's' : ''
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
            <StudentFilters
              state={state}
              dispatch={dispatch}
              allSkills={allSkills}
              tabsRef={tabsRef as React.RefObject<HTMLDivElement>}
              studentsCount={filteredStudents.length}
            />

            {/* Utilisation des tabs avec contenu unifié */}
            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              {/* Utilisation du nouveau composant ItemGrid */}
              <ItemGrid
                items={currentStudents}
                renderItem={(student) => <StudentCard {...student} />}
                keyExtractor={(student) => student.id}
                emptyState={{
                  title: 'Aucun étudiant trouvé',
                  description: 'Aucun étudiant ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.ALTERNANT} className="mt-0">
              <ItemGrid
                items={currentStudents}
                renderItem={(student) => <StudentCard {...student} />}
                keyExtractor={(student) => student.id}
                emptyState={{
                  title: 'Aucun étudiant trouvé',
                  description: 'Aucun étudiant ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.STAGIAIRE} className="mt-0">
              <ItemGrid
                items={currentStudents}
                renderItem={(student) => <StudentCard {...student} />}
                keyExtractor={(student) => student.id}
                emptyState={{
                  title: 'Aucun étudiant trouvé',
                  description: 'Aucun étudiant ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Utilisation du nouveau composant Pagination */}
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
