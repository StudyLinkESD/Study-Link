export type UserType = 'student' | 'company-owner';

export interface BaseCreateUserDTO {
  email?: string | null;
  googleEmail?: string | null;
  firstname: string;
  lastname: string;
  type: UserType;
  profilePictureId?: string | null;
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
  email?: string | null;
  googleEmail?: string | null;
  firstname?: string;
  lastname?: string;
  profilePictureId?: string | null;
}

export interface UserResponseDTO {
  id: string;
  email?: string | null;
  googleEmail?: string | null;
  firstname: string;
  lastname: string;
  profilePictureId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
