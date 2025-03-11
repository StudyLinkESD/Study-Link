import { render } from '@react-email/render';
import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { Resend as ResendClient } from 'resend';

import { prisma } from '@/lib/prisma';

import AuthenticateEmail from './emails/authenticate';
import SchoolOwnerAuthenticateEmail from './emails/school-owner-authenticate';

// Définir une clé API par défaut pour Resend
const RESEND_API_KEY = process.env.AUTH_RESEND_KEY || '';
const DEFAULT_FROM = 'StudyLink <noreply@studylink.space>';

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
          // Extraire l'URL de callback de l'URL du lien de vérification
          const callbackUrlMatch = url.match(/callbackUrl=([^&]*)/);
          const callbackUrl = callbackUrlMatch ? decodeURIComponent(callbackUrlMatch[1]) : '';

          console.log('URL de vérification:', url);
          console.log('URL de callback extraite:', callbackUrl);

          const user = await prisma.user.findUnique({
            where: { email: identifier },
            select: {
              firstName: true,
              type: true,
              schoolOwner: true,
            },
          });

          // Déterminer si c'est un school owner
          const isSchoolOwner = user && user.type === 'school_owner' && user.schoolOwner;

          // Choisir le template d'email en fonction du type d'utilisateur
          let emailHtml;
          let emailSubject;
          let finalUrl = url;

          if (isSchoolOwner) {
            // Si c'est un school owner, modifier l'URL de callback
            if (callbackUrl) {
              const baseUrl =
                process.env.NEXTAUTH_URL ||
                process.env.NEXT_PUBLIC_MAIN_URL ||
                'http://localhost:3000';
              const newCallbackUrl = `${baseUrl}/school/students`;
              finalUrl = url.replace(
                /callbackUrl=([^&]*)/,
                `callbackUrl=${encodeURIComponent(newCallbackUrl)}`,
              );
              console.log('URL modifiée pour school owner:', finalUrl);
            }

            // Template pour les school owners
            emailHtml = await render(
              SchoolOwnerAuthenticateEmail({
                url: finalUrl,
                firstName: user?.firstName || undefined,
              }),
            );
            emailSubject = 'Connexion à votre espace administrateur StudyLink';
          } else {
            // Template standard pour les autres utilisateurs
            emailHtml = await render(
              AuthenticateEmail({
                url: finalUrl,
                firstName: user?.firstName || undefined,
              }),
            );
            emailSubject = 'Bienvenue sur StudyLink - Votre lien de connexion';
          }

          if (!emailHtml) {
            console.error("Erreur lors de la génération du HTML de l'email");
            throw new Error("Erreur lors de la génération du HTML de l'email");
          }

          // Utiliser directement l'API Resend au lieu de passer par notre API
          const resendClient = new ResendClient(RESEND_API_KEY);
          const { data, error } = await resendClient.emails.send({
            from: DEFAULT_FROM,
            to: identifier,
            subject: emailSubject,
            html: emailHtml,
          });

          if (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            throw new Error(error.message);
          }

          console.log('Email envoyé avec succès:', data);
        } catch (error) {
          console.error('Erreur dans sendVerificationRequest:', error);
          throw error;
        }
      },
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig;
