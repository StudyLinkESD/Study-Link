export type UserType = 'student' | 'company-owner';

export interface BaseCreateUserDTO {
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  type: UserType;
  profilePicture?: string | null;
}

export interface CreateStudentUserDTO extends BaseCreateUserDTO {
  type: 'student';
  schoolId: string;
  studentEmail: string;
}

export interface CreateCompanyOwnerUserDTO extends BaseCreateUserDTO {
  type: 'company-owner';
  companyName: string;
}

export type CreateUserDTO = CreateStudentUserDTO | CreateCompanyOwnerUserDTO;

export interface UpdateUserDTO {
  email: string;
  firstname?: string;
  lastname?: string;
  profilePicture?: string | null;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  profilePicture?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
