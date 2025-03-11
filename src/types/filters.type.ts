import { UserType } from './user.type';

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface BaseFilters extends PaginationParams {
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface UserFilters extends BaseFilters {
  type?: UserType;
  schoolId?: string;
  companyId?: string;
  isProfileCompleted?: boolean;
  isVerified?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
