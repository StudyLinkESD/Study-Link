export interface CreateStudentDTO {
  userId: string;
  schoolId: string;
  status: string;
  skills: string;
  apprenticeshipRythm?: string;
  description: string;
  curriculumVitae?: string;
  previousCompanies: string;
  availability: boolean;
}

export interface UpdateStudentDTO {
  status?: string;
  skills?: string;
  apprenticeshipRythm?: string;
  description?: string;
  curriculumVitae?: string;
  previousCompanies?: string;
  availability?: boolean;
}

export interface StudentResponseDTO {
  id: string;
  userId: string;
  schoolId: string;
  primaryRecommendationId?: string;
  status: string;
  skills: string;
  apprenticeshipRythm?: string;
  description: string;
  curriculumVitae?: string;
  previousCompanies: string;
  availability: boolean;
  user?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    profilePicture?: string | null;
  };
  school?: {
    id: string;
    name: string;
  };
}
