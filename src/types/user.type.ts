import { Timestamps } from './timestamps.type';

export enum UserType {
  STUDENT = 'student',
  COMPANY_OWNER = 'company_owner',
  SCHOOL_OWNER = 'school_owner',
  ADMIN = 'admin',
}

interface IUser extends Timestamps {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  type: UserType;
  profile_picture: string;
  email_verified: string;
}

export type { IUser };

interface IUserDTO {
  firstName: string | null;
  lastName: string | null;
  email: string;
  profile_picture: string;
}

export type { IUserDTO };
