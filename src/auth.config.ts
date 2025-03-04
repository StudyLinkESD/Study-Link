import { NextAuthConfig } from 'next-auth';
import Resend from 'next-auth/providers/resend';
import SignupEmail from './emails/signup';
import { render } from '@react-email/render';

export default {
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'StudyLink <onboarding@resend.dev>',
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          const emailHtml = render(SignupEmail({ url }));

          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend`, {
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
        } catch (error) {
          console.log(error);
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
