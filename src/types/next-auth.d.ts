import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      studentId?: string | null;
      isGoogleEmail?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    studentId?: string | null;
    isGoogleEmail?: boolean;
  }
}
