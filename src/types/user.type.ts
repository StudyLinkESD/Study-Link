import { Timestamps } from './timestamps.type';

interface IUser extends Timestamps {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture: string;
  email_verified: string;
}

interface IUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  profile_picture: string;
}

export type { IUser, IUserDTO };
