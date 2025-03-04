"use client";

import { useRef, useMemo, useCallback, useReducer, useState } from "react";
import StudentCard, { StudentCardProps } from "./StudentCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

// Constantes nommées pour éviter les valeurs magiques
const STUDENTS_PER_PAGE = 9;
const STATUS_OPTIONS = {
  ALL: "all",
  ALTERNANT: "Alternant",
  STAGIAIRE: "Stagiaire",
};

// Helper pour debounce
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return function (this: any, ...args: Parameters<T>): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

type Student = Omit<StudentCardProps, "skills"> & {
  skills: { id: string; name: string }[];
};

type StudentListProps = {
  students: Student[];
  title?: string;
  isLoading?: boolean;
};

// Définition de l'état initial et du reducer pour useReducer
type FilterState = {
  statusFilter: string;
  searchTerm: string;
  selectedSkills: string[];
  currentPage: number;
};

type FilterAction =
  | { type: "SET_STATUS_FILTER"; payload: string }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "ADD_SKILL"; payload: string }
  | { type: "REMOVE_SKILL"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "RESET_FILTERS" };

const initialFilterState: FilterState = {
  statusFilter: STATUS_OPTIONS.ALL,
  searchTerm: "",
  selectedSkills: [],
  currentPage: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case "ADD_SKILL":
      // Si la compétence est vide ou déjà incluse, ne pas la traiter
      if (!action.payload || state.selectedSkills.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedSkills: [...state.selectedSkills, action.payload],
        currentPage: 1,
      };
    case "REMOVE_SKILL":
      return {
        ...state,
        selectedSkills: state.selectedSkills.filter(
          (skill) => skill !== action.payload
        ),
        currentPage: 1,
      };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "RESET_FILTERS":
      // Garantir que nous revenons bien à l'état initial
      return { ...initialFilterState };
    default:
      return state;
  }
}

// Composant pour les filtres extraits
function StudentFilters({
  state,
  dispatch,
  allSkills,
  tabsRef,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  allSkills: string[];
  tabsRef: React.RefObject<HTMLDivElement>;
  studentsCount: number;
}) {
  // Création d'un debounce pour la recherche
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch({ type: "SET_SEARCH_TERM", payload: value });
    }, 300),
    []
  );

  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });

    // Force programmatiquement le changement d'onglet
    if (tabsRef.current) {
      // Trouver le TabsTrigger qui correspond à "all" et simuler un clic
      const allTab = tabsRef.current.querySelector('button[value="all"]');
      if (allTab) {
        (allTab as HTMLElement).click();
      }
    }
  };

  const [selectKey, setSelectKey] = useState(0);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <TabsList>
          <TabsTrigger value={STATUS_OPTIONS.ALL}>
            Tous {state.statusFilter === STATUS_OPTIONS.ALL}
          </TabsTrigger>
          <TabsTrigger value={STATUS_OPTIONS.ALTERNANT}>
            Alternants {state.statusFilter === STATUS_OPTIONS.ALTERNANT}
          </TabsTrigger>
          <TabsTrigger value={STATUS_OPTIONS.STAGIAIRE}>
            Stagiaires {state.statusFilter === STATUS_OPTIONS.STAGIAIRE}
          </TabsTrigger>
        </TabsList>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Rechercher..."
            defaultValue={state.searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-8"
            aria-label="Rechercher..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 mb-4">
        <Label className="block" htmlFor="skills-filter">
          Filtrer par compétences
        </Label>
        {/* Conteneur à hauteur fixe avec défilement au besoin */}
        <div className="flex flex-wrap gap-2 min-h-[38px] max-h-[76px] overflow-y-auto p-1">
          {state.selectedSkills.length === 0 && (
            <div className="text-muted-foreground text-sm italic">
              Aucun filtre sélectionné
            </div>
          )}
          {state.selectedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="px-2 py-1 h-[30px] flex items-center"
            >
              {skill}
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_SKILL", payload: skill })
                }
                className="ml-2 hover:text-destructive"
                aria-label={`Supprimer le filtre ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center content-center gap-4">
          <Select
            key={selectKey} // La clé force un re-rendu complet quand elle change
            onValueChange={(value) => {
              if (value) {
                dispatch({ type: "ADD_SKILL", payload: value });
                // Forcer le Select à se réinitialiser en changeant sa clé
                setSelectKey((prev) => prev + 1);
              }
            }}
            value=""
          >
            <SelectTrigger className="w-full sm:w-[210px]">
              <SelectValue placeholder="Ajouter une compétence" />
            </SelectTrigger>
            <SelectContent>
              {allSkills
                .filter((skill) => !state.selectedSkills.includes(skill))
                .map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {(state.selectedSkills.length > 0 ||
            state.searchTerm ||
            state.statusFilter !== STATUS_OPTIONS.ALL) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default function StudentList({
  students,
  title = "Liste des étudiants",
  isLoading = false,
}: StudentListProps) {
  // Utilisation de useReducer pour la gestion d'état
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, selectedSkills, currentPage } = state;

  // Référence aux Tabs pour pouvoir forcer la valeur programmatiquement
  const tabsRef = useRef<HTMLDivElement>(null);

  // Utilisation de useMemo pour optimiser les calculs coûteux
  const allSkills = useMemo(
    () =>
      Array.from(
        new Set(
          students.flatMap((student) => student.skills.map((s) => s.name))
        )
      ).sort(),
    [students]
  );

  // Optimisation du filtrage avec useMemo
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
          (student.school && student.school.toLowerCase().includes(searchLower))
      );
    }

    if (selectedSkills.length > 0) {
      result = result.filter((student) =>
        selectedSkills.every((skill) =>
          student.skills.some(
            (s) => s.name.toLowerCase() === skill.toLowerCase()
          )
        )
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

  // Gestion de l'affichage pendant le chargement
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
          {`${filteredStudents.length} étudiant${
            filteredStudents.length !== 1 ? "s" : ""
          } trouvé${filteredStudents.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <Card>
        <CardContent>
          <Tabs
            ref={tabsRef}
            defaultValue={STATUS_OPTIONS.ALL}
            value={statusFilter}
            className="w-full"
            onValueChange={(value) =>
              dispatch({ type: "SET_STATUS_FILTER", payload: value })
            }
          >
            <StudentFilters
              state={state}
              dispatch={dispatch}
              allSkills={allSkills}
              tabsRef={tabsRef as React.RefObject<HTMLDivElement>}
              studentsCount={filteredStudents.length}
            />

            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              {renderStudentGrid()}
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.ALTERNANT} className="mt-0">
              {renderStudentGrid()}
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.STAGIAIRE} className="mt-0">
              {renderStudentGrid()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <nav className="flex justify-center mt-6" aria-label="Pagination">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                dispatch({
                  type: "SET_PAGE",
                  payload: Math.max(currentPage - 1, 1),
                })
              }
              disabled={currentPage === 1}
              aria-label="Précédent"
            >
              Précédent
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      dispatch({ type: "SET_PAGE", payload: page })
                    }
                    className="w-8 h-8 p-0"
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                dispatch({
                  type: "SET_PAGE",
                  payload: Math.min(currentPage + 1, totalPages),
                })
              }
              disabled={currentPage === totalPages}
              aria-label="Suivant"
            >
              Suivant
            </Button>
          </div>
        </nav>
      )}
    </div>
  );

  function renderStudentGrid() {
    if (currentStudents.length === 0) {
      return (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          role="status"
        >
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun étudiant trouvé</h3>
          <p className="text-muted-foreground">
            Aucun étudiant ne correspond à vos critères de recherche.
          </p>
        </div>
      );
    }

    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        role="list"
        aria-label="Liste des étudiants"
      >
        {currentStudents.map((student) => (
          <div key={student.id} role="listitem">
            <StudentCard {...student} />
          </div>
        ))}
      </div>
    );
  }
}
