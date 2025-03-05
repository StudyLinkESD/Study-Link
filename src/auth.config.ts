import { NextAuthConfig } from 'next-auth';
import Resend from 'next-auth/providers/resend';
import SignupEmail from './emails/signup';
import { render } from '@react-email/render';
import { prisma } from '@/lib/prisma';

export default {
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'StudyLink <onboarding@resend.dev>',
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: identifier },
            select: { firstname: true },
          });

          const emailHtml = await render(
            SignupEmail({
              url,
              firstname: user?.firstname || undefined,
            }),
          );

          if (!emailHtml) {
            console.error('Erreur lors de la génération du HTML de l\'email');
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
              url,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error(data.error || 'Erreur lors de l\'envoi de l\'email');
          }
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
