'use client';

import React, { useRef, useMemo, useReducer } from 'react';
import StudentCard, { StudentCardProps } from './StudentCard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import StudentFilters, { FilterState, FilterAction } from './StudentFilters';
import { STUDENT_STATUS } from '@/constants/status';

const STUDENTS_PER_PAGE = 9;

type Student = Omit<StudentCardProps, 'skills'> & {
  skills: { id: string; name: string }[];
};

type StudentListProps = {
  students: Student[];
  title?: string;
  isLoading?: boolean;
};

const initialFilterState: FilterState = {
  statusFilter: STUDENT_STATUS.ALL,
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

function StudentListComponent({
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

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (statusFilter !== STUDENT_STATUS.ALL) {
      result = result.filter((student) => student.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          (student.firstName?.toLowerCase() ?? '').includes(searchLower) ||
          (student.lastName?.toLowerCase() ?? '').includes(searchLower) ||
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

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const currentStudents = useMemo(() => {
    const indexOfLastStudent = currentPage * STUDENTS_PER_PAGE;
    const indexOfFirstStudent = indexOfLastStudent - STUDENTS_PER_PAGE;
    return filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  }, [filteredStudents, currentPage]);

  const renderStudent = React.useCallback(
    (student: Student) => (
      <StudentCard
        id={student.id}
        firstName={student.firstName}
        lastName={student.lastName}
        photoUrl={student.photoUrl}
        status={student.status}
        skills={student.skills}
        school={student.school}
      />
    ),
    [],
  );

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
            defaultValue={STUDENT_STATUS.ALL}
            value={statusFilter}
            className="w-full"
            onValueChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', payload: value })}
          >
            <StudentFilters state={state} dispatch={dispatch} allSkills={allSkills} />

            <TabsContent value={statusFilter} className="mt-6">
              <ItemGrid
                items={currentStudents}
                renderItem={renderStudent}
                keyExtractor={(student) => student.id}
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                emptyState={{
                  title: 'Aucun étudiant trouvé',
                  description:
                    'Aucun étudiant ne correspond à vos critères de recherche. Essayez de modifier vos filtres.',
                }}
              />

              {filteredStudents.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => dispatch({ type: 'SET_PAGE', payload: page })}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const StudentList = React.memo(StudentListComponent);

export default StudentList;
