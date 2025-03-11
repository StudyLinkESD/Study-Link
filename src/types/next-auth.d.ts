import 'next-auth';
import { DefaultSession } from 'next-auth';

import { UserType } from './user.type';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      studentId?: string | null;
      companyId?: string | null;
      isGoogleEmail?: boolean;
      firstName?: string | null;
      lastName?: string | null;
      profilePicture?: string | null;
      type?: UserType;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    studentId?: string | null;
    companyId?: string | null;
    isGoogleEmail?: boolean;
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
    type?: UserType;
    isAdmin?: boolean;
  }
}
