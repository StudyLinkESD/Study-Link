import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import { prisma } from '@/lib/prisma';

import authConfig from '@/auth.config';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      isGoogleEmail?: boolean;
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
        token.isGoogleEmail = account.provider === 'google';
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.isGoogleEmail = token.isGoogleEmail as boolean;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      return `${baseUrl}/students/profile-info`;
    },
    async signIn({ account, profile, user }) {
      if (account?.provider === 'google' && profile?.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: profile.email,
          },
          include: {
            Account: true,
          },
        });

        if (existingUser) {
          if (!existingUser.Account.some((acc) => acc.provider === 'google')) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
          return true;
        }

        if (profile.name) {
          const nameParts = profile.name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          try {
            await prisma.user.create({
              data: {
                email: profile.email,
                firstName,
                lastName,
                Account: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                },
              },
            });
            return true;
          } catch (error) {
            console.error("Erreur lors de la création de l'utilisateur:", error);
            return false;
          }
        }
      } else if (user?.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: user.email,
          },
        });

        if (!existingUser) {
          try {
            await prisma.user.create({
              data: {
                email: user.email,
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
