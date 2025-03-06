interface IUser {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  profilePictureId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { IUser };
