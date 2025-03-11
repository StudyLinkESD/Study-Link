interface IUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture?: string | null;
  createdAt: Date;
  updatedAt: Date;
  studentId?: string | null;
  companyId?: string | null;
  isAdmin?: boolean;
}

export type { IUser };
