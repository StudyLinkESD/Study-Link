import axios, { AxiosRequestConfig } from 'axios';

import { prisma } from '@/lib/prisma';

import { CreateStudentDTO, StudentResponseDTO, UpdateStudentDTO } from '@/dto/student.dto';

function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL;
}

async function serverFetch(url: string, options: RequestInit = {}) {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  console.log('Fetching from:', fullUrl);

  try {
    const axiosConfig: AxiosRequestConfig = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    };

    if (options.body) {
      axiosConfig.data = JSON.parse(options.body as string);
    }

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

    if (process.env.NODE_ENV === 'production') {
      const students = await prisma.student.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
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

    const students = await serverFetch('/students');
    console.log('Raw students data:', students);

    if (!Array.isArray(students)) {
      throw new Error('Students data is not an array');
    }

    const studentsWithUserInfo = await Promise.all(
      students.map(async (student) => {
        try {
          const userData = await serverFetch(`/users/${student.userId}`);
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
