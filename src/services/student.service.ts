// src/services/student.service.ts
import { StudentResponseDTO, CreateStudentDTO, UpdateStudentDTO } from '@/dto/student.dto';
import { prisma } from '@/lib/prisma';
import { apiService } from './api.service';

// Types pour les réponses API
interface UserResponse {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  profilePicture?: string | null;
}

interface SchoolResponse {
  id: string;
  name: string;
}

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

  try {
    const axiosConfig = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
      data: options.body ? JSON.parse(options.body as string) : undefined,
    };

    const response = await axios(fullUrl, axiosConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API Error (${url}):`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        body: error.response?.data,
      });
      throw new Error(`API Error: ${error.response?.status} ${error.response?.statusText}`);
    }
    throw error;
  }
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
    const response = await apiService.get<StudentResponseDTO[]>('/students');
    console.log('Raw students data:', response.data);

    if (!Array.isArray(response.data)) {
      throw new Error('Students data is not an array');
    }

    // Récupérer les informations utilisateur pour chaque étudiant
    const studentsWithUserInfo = await Promise.all(
      response.data.map(async (student) => {
        try {
          // Récupérer les informations de l'utilisateur
          const userData = await apiService.get<UserResponse>(`/users/${student.userId}`);
          // Récupérer les informations de l'école
          const schoolData = await apiService.get<SchoolResponse>(`/schools/${student.schoolId}`);

          return {
            ...student,
            user: userData.data,
            school: schoolData.data,
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
    const response = await apiService.get<StudentResponseDTO>(`/students/${id}`);

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      apiService.get<UserResponse>(`/users/${response.data.userId}`),
      apiService.get<SchoolResponse>(`/schools/${response.data.schoolId}`),
    ]);

    return {
      ...response.data,
      user: userData.data,
      school: schoolData.data,
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
    const response = await apiService.get<StudentResponseDTO>(`/students/user/${userId}`);

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      apiService.get<UserResponse>(`/users/${response.data.userId}`),
      apiService.get<SchoolResponse>(`/schools/${response.data.schoolId}`),
    ]);

    return {
      ...response.data,
      user: userData.data,
      school: schoolData.data,
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
    const response = await apiService.post<StudentResponseDTO, CreateStudentDTO>('/students', data);

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      apiService.get<UserResponse>(`/users/${response.data.userId}`),
      apiService.get<SchoolResponse>(`/schools/${response.data.schoolId}`),
    ]);

    return {
      ...response.data,
      user: userData.data,
      school: schoolData.data,
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
    const response = await apiService.put<StudentResponseDTO, UpdateStudentDTO>(
      `/students/${id}`,
      data,
    );

    // Récupérer les informations de l'utilisateur et de l'école
    const [userData, schoolData] = await Promise.all([
      apiService.get<UserResponse>(`/users/${response.data.userId}`),
      apiService.get<SchoolResponse>(`/schools/${response.data.schoolId}`),
    ]);

    return {
      ...response.data,
      user: userData.data,
      school: schoolData.data,
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
