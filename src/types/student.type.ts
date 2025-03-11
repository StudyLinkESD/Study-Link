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

export type { IStudent };

export enum StudentStatus {
  ALTERNANT = 'Alternant',
  STAGIAIRE = 'Stagiaire',
}

export enum ExperienceType {
  STAGE = 'Stage',
  ALTERNANCE = 'Alternance',
  CDI = 'CDI',
  CDD = 'CDD',
  AUTRE = 'Autre',
}
