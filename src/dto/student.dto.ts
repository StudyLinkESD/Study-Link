export interface CreateStudentDTO {
  userId: string;
  schoolId: string;
  studentEmail: string;
  status: 'Alternant' | 'Stagiaire';
  skills: string;
  apprenticeshipRhythm: string | null;
  description: string;
  curriculumVitae?: string | null;
  previousCompanies: string;
  experiences?: ExperienceDTO[];
  availability: boolean;
  user?: {
    firstName: string | null;
    lastName: string | null;
  };
}

export interface ExperienceDTO {
  id?: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
}

export interface UpdateStudentDTO
  extends Partial<Omit<CreateStudentDTO, 'userId' | 'schoolId' | 'studentEmail'>> {
  updatedAt?: Date;
}

export interface StudentResponseDTO extends Omit<CreateStudentDTO, 'skills'> {
  id: string;
  primaryRecommendationId: string | null;
  skills: string;
  experiences?: ExperienceDTO[];
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture?: string | null;
  };
  school: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateStudentData = CreateStudentDTO;
