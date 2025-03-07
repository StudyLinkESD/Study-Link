export interface CreateStudentDTO {
  userId: string;
  schoolId: string;
  studentEmail: string;
  status: 'ACTIVE' | 'INACTIVE';
  skills: string;
  apprenticeshipRythm: string | null;
  description: string;
  curriculumVitae?: { fileUrl: string; fileId: string } | null;
  previousCompanies: string;
  availability: boolean;
}

export interface UpdateStudentDTO
  extends Partial<Omit<CreateStudentDTO, 'userId' | 'schoolId' | 'studentEmail'>> {
  updatedAt?: Date;
}

export interface StudentResponseDTO extends Omit<CreateStudentDTO, 'skills'> {
  id: string;
  primaryRecommendationId: string | null;
  skills: string;
  user: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    profilePicture?: string | null;
  };
  school: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// Cette interface est maintenant basée sur CreateStudentDTO pour assurer la cohérence
export interface CreateStudentData extends CreateStudentDTO {
  createdAt: Date;
}
