import { IUser } from '@/types/user.type';

interface IStudent extends IUser {
  user_id: string;
  school_id: string;
  recommendation_id: string;
  status: string;
  skills: string;
  apprenticeship_rythm: string;
  description: string;
  curriculum_vitae: string;
  previous_companies: string;
  availability: string;
}

interface StudentProfileFormData {
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE';
  schoolId: string;
  studentEmail: string;
  skills: string[];
  apprenticeshipRythm?: string | null;
  description: string;
  curriculumVitae?: { uuid: string; fileUrl: string } | null;
  previousCompanies: string;
  availability: boolean;
  profilePicture?: { uuid: string; fileUrl: string } | null;
}

export type { IStudent, StudentProfileFormData };
