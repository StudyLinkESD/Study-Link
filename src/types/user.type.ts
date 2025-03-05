interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture: string;
  email_verified: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

interface IUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  profile_picture: string;
}

export type { IUser, IUserDTO };
