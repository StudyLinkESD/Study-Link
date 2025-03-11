import { PrismaAdapter } from '@auth/prisma-adapter';
import { Prisma } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';

import { prisma } from '@/lib/prisma';

import { UserType } from '@/types/user.type';

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
      studentId?: string | null;
      type: UserType;
    } & DefaultSession['user'];
  }
}

const toPrismaUserType = (type: UserType): Prisma.UserCreateInput['type'] => type;
const fromPrismaUserType = (type: Prisma.UserCreateInput['type']): UserType => {
  switch (type) {
    case 'student':
      return UserType.STUDENT;
    case 'company_owner':
      return UserType.COMPANY_OWNER;
    case 'school_owner':
      return UserType.SCHOOL_OWNER;
    case 'admin':
      return UserType.ADMIN;
    default:
      return UserType.STUDENT;
  }
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  // @ts-expect-error - Known issue with different @auth/core versions
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
        if (user.id) {
          token.id = user.id;
          token.isGoogleEmail = account.provider === 'google';

          const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });
          token.studentId = student?.id ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
        session.user.isGoogleEmail = token.isGoogleEmail ?? false;
        session.user.studentId = token.studentId ?? null;

        const userData = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
            type: true,
            student: {
              select: {
                id: true,
              },
            },
            companyOwner: {
              select: {
                id: true,
                companyId: true,
              },
            },
            admin: {
              select: {
                id: true,
              },
            },
          },
        });

        if (userData) {
          session.user.firstName = userData.firstName;
          session.user.lastName = userData.lastName;
          session.user.profilePicture = userData.profilePicture;
          session.user.type = fromPrismaUserType(userData.type);
          session.user.studentId = userData.student?.id ?? null;
          session.user.companyId = userData.companyOwner?.companyId ?? null;
          session.user.isAdmin = !!userData.admin;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      return `${baseUrl}/select-profile`;
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
          const hasGoogleAccount = existingUser.Account.some((acc) => acc.provider === 'google');

          if (!hasGoogleAccount) {
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
          const firstName = nameParts[0] || null;
          const lastName = nameParts.slice(1).join(' ') || null;

          try {
            await prisma.user.create({
              data: {
                email: profile.email,
                firstName,
                lastName,
                type: toPrismaUserType(UserType.STUDENT),
                profileCompleted: false,
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
                firstName: null,
                lastName: null,
                type: toPrismaUserType(UserType.STUDENT),
                profileCompleted: false,
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
