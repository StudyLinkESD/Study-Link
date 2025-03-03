import { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";

export default {
    providers: [
        Resend({
            apiKey: process.env.NEXT_PUBLIC_AUTH_RESEND_KEY,
            from: "Dev <onboarding@resend.dev>",
            async sendVerificationRequest({ identifier, url, provider }) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${provider.apiKey}`,
                        },
                        body: JSON.stringify({
                            from: provider.from,
                            to: identifier,
                            subject: "Votre lien de connexion",
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
