import { Timestamps } from './timestamps.type';

interface IUser extends Timestamps {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profile_picture: string;
  email_verified: string;
}

interface IUserDTO {
  firstName: string | null;
  lastName: string | null;
  email: string;
  profile_picture: string;
}

export type { IUser, IUserDTO };
