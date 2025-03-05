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
    signIn: '/login',
    error: '/auth/error',
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
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!existingUser && profile.name) {
          const nameParts = profile.name.split(' ');
          const firstname = nameParts[0] || '';
          const lastname = nameParts.slice(1).join(' ') || '';

          try {
            await prisma.user.create({
              data: {
                email: profile.email,
                firstname,
                lastname,
              },
            });
          } catch (error) {
            console.error("Erreur lors de la création de l'utilisateur:", error);
            return false;
          }
        }
      }
      return true;
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
