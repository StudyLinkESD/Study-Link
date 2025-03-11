import { Suspense } from 'react';

import StudentList from '@/components/app/students/StudentList';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { getStudents } from '@/services/student.service';

export default async function StudentsPage() {
  try {
    const studentsData = await getStudents();

    const students = studentsData.map((student) => {
      const skillsArray =
        student.skills?.split(',').map((s) => ({ id: s.trim(), name: s.trim() })) || [];

      const mappedStatus =
        student.status === 'Alternant' || student.status === 'Stagiaire'
          ? student.status
          : 'Alternant';

      return {
        id: student.id,
        firstName: student.user?.firstName || 'Anonyme',
        lastName: student.user?.lastName || 'Anonyme',
        photoUrl: student.user?.profilePicture || '',
        status: mappedStatus,
        school: student.school?.name || '',
        skills: skillsArray,
        description: student.description || '',
        apprenticeshipRhythm: student.apprenticeshipRhythm || null,
        availability: student.availability ?? false,
        studentEmail: student.studentEmail || '',
        curriculumVitae: student.curriculumVitae || null,
      };
    });

    if (students.length === 0) {
      return (
        <main className="container mx-auto px-4 py-8">
          <ErrorMessage
            title="Aucun étudiant trouvé"
            message="Il n'y a pas d'étudiants disponibles pour le moment."
          />
        </main>
      );
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <StudentList students={students} title="Découvrez nos étudiants" />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error('Erreur lors du chargement des étudiants:', error);
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorMessage
          title="Erreur de chargement"
          message="Une erreur est survenue lors du chargement des étudiants. Veuillez réessayer plus tard."
        />
      </main>
    );
  }
}
