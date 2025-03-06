// src/services/student.service.ts
import { StudentResponseDTO, CreateStudentDTO, UpdateStudentDTO } from '@/dto/student.dto';
import { prisma } from '@/lib/prisma';

// Fonction utilitaire pour obtenir l'URL de base
function getBaseUrl() {
  // En développement, utiliser localhost:3000
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/api';
  }
  // En production, utiliser l'URL de l'API ou une URL par défaut
  return process.env.NEXT_PUBLIC_API_URL;
}

// Fonction utilitaire pour les appels API côté serveur
async function serverFetch(url: string, options: RequestInit = {}) {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  console.log('Fetching from:', fullUrl);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${url}):`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
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

    // Utiliser Prisma directement pendant le build
    if (process.env.NODE_ENV === 'production') {
      const students = await prisma.student.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
              profilePicture: true,
            },
          },
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return students as unknown as StudentResponseDTO[];
    }

    // En développement, utiliser l'API
    const students = await serverFetch('/students');
    console.log('Raw students data:', JSON.stringify(students, null, 2));

    if (!Array.isArray(students)) {
      throw new Error('Students data is not an array');
    }

    // Récupérer les informations utilisateur pour chaque étudiant
    const studentsWithUserInfo = await Promise.all(
      students.map(async (student) => {
        try {
          console.log(`Fetching data for student ${student.id}:`, student);
          // Récupérer les informations de l'utilisateur
          const userData = await serverFetch(`/users/${student.userId}`);
          console.log(`User data for student ${student.id}:`, userData);
          // Récupérer les informations de l'école
          const schoolData = await serverFetch(`/schools/${student.schoolId}`);
          console.log(`School data for student ${student.id}:`, schoolData);

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

    console.log('Final students data:', JSON.stringify(studentsWithUserInfo, null, 2));
    return studentsWithUserInfo;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
}

export async function getStudentById(id: string): Promise<StudentResponseDTO | null> {
  try {
    console.log('Fetching student with ID:', id);

    // Récupérer directement l'étudiant par son ID
    const student = await serverFetch(`/students/${id}`);
    console.log('Raw student data:', JSON.stringify(student, null, 2));

    if (!student) {
      console.log('No student data received');
      return null;
    }

    // Récupérer les informations de l'utilisateur et de l'école
    try {
      const [userData, schoolData] = await Promise.all([
        serverFetch(`/users/${student.userId}`),
        serverFetch(`/schools/${student.schoolId}`),
      ]);

      console.log('User data:', JSON.stringify(userData, null, 2));
      console.log('School data:', JSON.stringify(schoolData, null, 2));

      return {
        ...student,
        user: userData,
        school: schoolData,
      };
    } catch (error) {
      console.error('Error fetching user or school data:', error);
      // Retourner l'étudiant même si les données utilisateur ou école ne sont pas disponibles
      return student;
    }
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération de l'étudiant:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      id,
      errorObject: error,
    });

    if (error instanceof Error && error.message.includes('404')) {
      console.log('Student not found');
      return null;
    }
    throw error;
  }
}

export async function getStudentByUserId(userId: string): Promise<StudentResponseDTO | null> {
  try {
    console.log('Fetching student for userId:', userId);
    const student = await serverFetch(`/students/user/${userId}`);
    console.log('Student data received:', student);

    if (!student) {
      console.log('No student data received');
      return null;
    }

    return student;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        console.log('Student not found for userId:', userId);
        return null;
      }
    }
    throw error;
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
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Student not found');
      }
      if (error.message.includes('400')) {
        throw new Error('Invalid student data');
      }
    }
    console.error('Failed to update student:', error);
    throw error;
  }
}
