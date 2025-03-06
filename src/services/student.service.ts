// src/services/student.service.ts
import { StudentResponseDTO, CreateStudentDTO, UpdateStudentDTO } from '@/dto/student.dto';

// Fonction utilitaire pour obtenir l'URL de base
function getBaseUrl() {
  // En développement, utiliser localhost:3000
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // En production, utiliser l'URL de l'API ou une URL par défaut
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

// Fonction utilitaire pour les appels API côté serveur
async function serverFetch(url: string, options: RequestInit = {}) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.error(`API Error (${url}):`, response.status, response.statusText);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data) {
    throw new Error('No data received from API');
  }
  return data;
}

export async function getStudents(): Promise<StudentResponseDTO[]> {
  try {
    console.log('Fetching all students...');
    const students = await serverFetch('/students');
    console.log('Raw students data:', students);

    if (!Array.isArray(students)) {
      throw new Error('Students data is not an array');
    }

    // Récupérer les informations utilisateur pour chaque étudiant
    const studentsWithUserInfo = await Promise.all(
      students.map(async (student) => {
        try {
          // Récupérer les informations de l'utilisateur
          const userData = await serverFetch(`/users/${student.userId}`);
          // Récupérer les informations de l'école
          const schoolData = await serverFetch(`/schools/${student.schoolId}`);

          return {
            ...student,
            user: userData,
            school: schoolData,
          };
        } catch (error) {
          console.error(`Error fetching user/school data for student ${student.id}:`, error);
          return student;
        }
      }),
    );

    return studentsWithUserInfo;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
}

export async function getStudentById(id: string): Promise<StudentResponseDTO | null> {
  try {
    console.log('Fetching student with ID:', id);
    const student = await serverFetch(`/students/${id}`);

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      serverFetch(`/users/${student.userId}`),
      serverFetch(`/schools/${student.schoolId}`),
    ]);

    return {
      ...student,
      user: userData,
      school: schoolData,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      console.log('Student not found');
      return null;
    }
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    return null;
  }
}

export async function getStudentByUserId(userId: string): Promise<StudentResponseDTO | null> {
  try {
    const student = await serverFetch(`/students/user/${userId}`);

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      serverFetch(`/users/${student.userId}`),
      serverFetch(`/schools/${student.schoolId}`),
    ]);

    return {
      ...student,
      user: userData,
      school: schoolData,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    return null;
  }
}

export async function createStudent(data: CreateStudentDTO): Promise<StudentResponseDTO> {
  try {
    const student = await serverFetch('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      serverFetch(`/users/${student.userId}`),
      serverFetch(`/schools/${student.schoolId}`),
    ]);

    return {
      ...student,
      user: userData,
      school: schoolData,
    };
  } catch (error) {
    console.error('Failed to create student:', error);
    throw error;
  }
}

export async function updateStudent(
  id: string,
  data: UpdateStudentDTO,
): Promise<StudentResponseDTO> {
  try {
    const student = await serverFetch(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      serverFetch(`/users/${student.userId}`),
      serverFetch(`/schools/${student.schoolId}`),
    ]);

    return {
      ...student,
      user: userData,
      school: schoolData,
    };
  } catch (error) {
    console.error('Failed to update student:', error);
    throw error;
  }
}
