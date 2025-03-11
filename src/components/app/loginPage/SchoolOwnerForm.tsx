'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
});

type AuthValues = z.infer<typeof authSchema>;

const SchoolOwnerAuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
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

      const checkResponse = await fetch('/api/auth/check-school-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        form.setError('email', {
          type: 'manual',
          message: checkData.error || "Une erreur s'est produite",
        });
        return;
      }

      const result = await signIn('resend', {
        email: data.email,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/verify-request');
      } else {
        toast.error('Une erreur est survenue lors de la connexion');
      }
    } catch {
      toast.error('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-2 ml-1 text-2xl font-medium">Authentification Administrateur École</h2>

      <Card className="w-full space-y-6 px-4 py-8">
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
                      <Input type="email" placeholder="admin@ecole.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Envoi en cours...' : 'Continuer avec email'}
              </Button>
            </form>
          </Form>

          <div className="text-muted-foreground mt-6 text-center text-xs">
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

export default SchoolOwnerAuthForm;
