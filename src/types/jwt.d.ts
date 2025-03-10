import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    isGoogleEmail?: boolean;
    studentId?: string | null;
  }
}
