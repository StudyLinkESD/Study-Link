interface IUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  profilePictureId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { IUser };
