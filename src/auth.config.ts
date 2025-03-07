import { render } from '@react-email/render';
import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';

import { prisma } from '@/lib/prisma';

import AuthenticateEmail from './emails/authenticate';

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
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'StudyLink <noreply@studylink.space>',
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: identifier },
            select: { firstName: true },
          });

          const baseUrl =
            process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000';
          const modifiedUrl = url.replace(
            /callbackUrl=([^&]*)/,
            `callbackUrl=${encodeURIComponent(`${baseUrl}/students/profile-info`)}`,
          );

          const emailHtml = await render(
            AuthenticateEmail({
              url: modifiedUrl,
              firstName: user?.firstName || undefined,
            }),
          );

          if (!emailHtml) {
            console.error("Erreur lors de la génération du HTML de l'email");
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
              from: provider.from,
              to: identifier,
              subject: 'Bienvenue sur StudyLink - Votre lien de connexion',
              html: emailHtml,
              url: modifiedUrl,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error(data.error || "Erreur lors de l'envoi de l'email");
          }
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
