import { StudentStatus } from './student.type';
import { ExperienceType } from './student.type';
import { UserType } from './user.type';

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface BaseFilters extends PaginationParams {
  search?: string;
}

export interface UserFilters extends BaseFilters {
  type?: UserType;
  schoolId?: string;
  companyId?: string;
  isProfileCompleted?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  isVerified?: boolean;
}

export interface StudentFilters extends BaseFilters {
  schoolId?: string;
  status?: StudentStatus;
  skills?: string[];
  availability?: boolean;
  apprenticeshipRhythm?: string;
}

export interface ExperienceFilters extends BaseFilters {
  type?: ExperienceType;
  company?: string;
  startDateAfter?: Date;
  startDateBefore?: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
