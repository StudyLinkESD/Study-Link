import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { Resend as ResendClient } from 'resend';

import { prisma } from '@/lib/prisma';

const RESEND_API_KEY = process.env.AUTH_RESEND_KEY || '';
const DEFAULT_FROM = 'StudyLink <noreply@studylink.space>';
const resend = new ResendClient(RESEND_API_KEY);

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Resend({
      apiKey: RESEND_API_KEY,
      from: DEFAULT_FROM,
      async sendVerificationRequest({ identifier, url }) {
        try {
          const callbackUrl = new URL(url).searchParams.get('callbackUrl') || '';

          const user = await prisma.user.findUnique({
            where: { email: identifier },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              type: true,
              schoolOwner: true,
            },
          });

          if (!user) {
            throw new Error('User not found');
          }

          const isSchoolOwner =
            user.type === 'school_owner' ||
            (await prisma.schoolOwner.findFirst({
              where: { userId: user.id },
            }));

          let finalUrl = url;

          if (isSchoolOwner) {
            if (user.type !== 'school_owner') {
              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { type: 'school_owner' },
                });
              } catch (error) {
                console.error('Erreur lors de la mise à jour du type utilisateur:', error);
              }
            }

            if (callbackUrl) {
              const callback = new URL(callbackUrl);
              callback.pathname = '/school/students';
              const newUrl = new URL(url);
              newUrl.searchParams.set('callbackUrl', callback.toString());
              finalUrl = newUrl.toString();
            }
          } else {
            if (callbackUrl) {
              const callback = new URL(callbackUrl);
              callback.pathname = '/select-profile';
              const newUrl = new URL(url);
              newUrl.searchParams.set('callbackUrl', callback.toString());
              finalUrl = newUrl.toString();
            }
          }

          const emailHtml = `
            <div>
              <h1>Connexion à Study Link</h1>
              <p>Bonjour ${user.firstName || ''},</p>
              <p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
              <a href="${finalUrl}">Se connecter</a>
              <p>Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
            </div>
          `;

          const { error } = await resend.emails.send({
            from: 'Study Link <no-reply@studylink.fr>',
            to: identifier,
            subject: isSchoolOwner
              ? 'Connexion à votre espace école Study Link'
              : 'Connexion à Study Link',
            html: emailHtml,
          });

          if (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            throw error;
          }
        } catch (error) {
          console.error('Erreur dans sendVerificationRequest:', error);
          throw error;
        }
      },
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig;
