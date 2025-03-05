import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    verifyRequest: `${process.env.NEXT_PUBLIC_MAIN_URL}/verify-request`,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user);
    },
    async signOut(message) {
      console.log('User signed out:', message);
    },
  },
  ...authConfig,
});
