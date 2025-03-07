import { Student } from '@prisma/client';

export type StudentProfileFormData = Pick<
  Student,
  'status' | 'skills' | 'description' | 'previousCompanies' | 'availability' | 'curriculumVitae'
> & {
  schoolId: string;
  studentEmail: string;
  apprenticeshipRythm?: string;
  firstName?: string;
  lastName?: string;
};
