'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
});

type AuthValues = z.infer<typeof authSchema>;

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleAuth = async (data: AuthValues) => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        '/api/auth/authenticate',
        { email: data.email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status >= 400) {
        toast.error(response.data.error || 'Une erreur est survenue');
        return;
      }

      toast.success('Un email de connexion vous a été envoyé');
      router.push('/verify-request');
    } catch {
      toast.error("Une erreur est survenue lors de l'authentification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { callbackUrl: '/students/profile-info' });
    } catch {
      toast.error("Une erreur est survenue lors de l'authentification avec Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-medium ml-1 mb-2">Authentification</h2>

      <Card className="w-full px-4 py-8 space-y-6">
        <CardContent className="px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="exemple@email.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Envoi en cours...' : 'Continuer avec email'}
              </Button>
            </form>
          </Form>

          <div className="relative mb-6 mt-6">
            <Separator className="absolute top-1/2 w-full" />
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">OU</span>
            </div>
          </div>

          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                'Connexion en cours...'
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 186.69 190.5"
                  >
                    <g transform="translate(1184.583 765.171)">
                      <path
                        d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"
                        fill="#4285f4"
                      />
                      <path
                        d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"
                        fill="#34a853"
                      />
                      <path
                        d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.695-24.592 31.695-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"
                        fill="#fbbc05"
                      />
                      <path
                        d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"
                        fill="#ea4335"
                      />
                    </g>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            En continuant, vous acceptez nos{' '}
            <a href="/terms-of-service" className="text-primary hover:underline">
              Conditions d&apos;utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Politique de confidentialité
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AuthForm;
