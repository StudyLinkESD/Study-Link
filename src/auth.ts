import { PrismaAdapter } from '@auth/prisma-adapter';
import { Admin, CompanyOwner, SchoolOwner, Student } from '@prisma/client';
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
      firstName?: string | null;
      lastName?: string | null;
      student?: Student | null;
      schoolOwner?: SchoolOwner | null;
      companyOwner?: CompanyOwner | null;
      admin?: Admin | null;
    } & DefaultSession['user'];
  }
}

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
    async signIn({ user, account, profile }) {
      console.log('Tentative de connexion :', {
        userEmail: user?.email,
        accountProvider: account?.provider,
        profileSub: profile?.sub,
      });

      if (!user?.email || !account || !profile) {
        console.error('Paramètres manquants pour la connexion', { user, account, profile });
        return false;
      }

      if (account.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
              Account: true,
            },
          });

          console.log('Utilisateur existant :', existingUser);

          if (existingUser) {
            const googleAccountLinked = existingUser.Account.some(
              (acc) => acc.provider === 'google',
            );

            if (!googleAccountLinked) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  provider: 'google',
                  providerAccountId: profile.sub as string,
                  type: account.type || 'oauth',
                  access_token: account.access_token || undefined,
                  refresh_token: account.refresh_token || undefined,
                  scope: account.scope || undefined,
                  id_token: account.id_token || undefined,
                  token_type: account.token_type || undefined,
                  expires_at: account.expires_at || undefined,
                },
              });

              console.log('Compte Google lié avec succès');
              return true;
            }

            console.log('Compte Google déjà lié');
            return true;
          } else {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                firstName: user.name?.split(' ')[0] || null,
                lastName: user.name?.split(' ').slice(1).join(' ') || null,
                profilePicture: user.image || null,
                type: UserType.STUDENT,
                Account: {
                  create: {
                    provider: 'google',
                    providerAccountId: profile.sub as string,
                    type: account.type || 'oauth',
                    access_token: account.access_token || undefined,
                    refresh_token: account.refresh_token || undefined,
                    scope: account.scope || undefined,
                    id_token: account.id_token || undefined,
                    token_type: account.token_type || undefined,
                    expires_at: account.expires_at || undefined,
                  },
                },
              },
            });

            console.log('Nouvel utilisateur créé avec le compte Google', newUser);
            return true;
          }
        } catch (error) {
          console.error('Erreur lors de la gestion de la connexion Google :', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        return { ...token, ...session.user };
      }

      if (!user) {
        return token;
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          include: {
            student: true,
            schoolOwner: true,
            companyOwner: true,
            admin: true,
          },
        });

        if (!dbUser) {
          await prisma.user.create({
            data: {
              email: token.email!,
              firstName: token.name?.split(' ')[0] || null,
              lastName: token.name?.split(' ').slice(1).join(' ') || null,
              profilePicture: token.picture,
              type: UserType.STUDENT,
            },
          });
          return token;
        }

        return {
          ...token,
          id: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          type: dbUser.type as UserType,
          student: dbUser.student,
          schoolOwner: dbUser.schoolOwner,
          companyOwner: dbUser.companyOwner,
          admin: dbUser.admin,
        };
      } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        return token;
      }
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          firstName: token.firstName as string | null,
          lastName: token.lastName as string | null,
          type: token.type as UserType,
          student: token.student as Student | null,
          schoolOwner: token.schoolOwner as SchoolOwner | null,
          companyOwner: token.companyOwner as CompanyOwner | null,
          admin: token.admin as Admin | null,
        },
      };
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        url = new URL(url, baseUrl).toString();
      }

      if (url.includes('/school/students')) {
        return url;
      }

      if (url.includes('/select-profile')) {
        return url;
      }

      if (url === baseUrl + '/login') {
        return baseUrl + '/select-profile';
      }

      if (url === baseUrl + '/signout') {
        return baseUrl + '/select-profile';
      }

      return baseUrl + '/select-profile';
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
