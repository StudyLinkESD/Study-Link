'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';

const registerSchema = z.object({
  firstname: z.string().min(2, 'Le prénom est requis'),
  lastname: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  companyName: z.string().optional(),
  schoolId: z.string().optional(),
  logo: z.any().optional(),
  cv: z.any().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
});

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [statusFilter, setStatusFilter] = useState<string>('student');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      companyName: '',
      schoolId: '',
    },
  });

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmitRegister = async (data: RegisterValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok && result.exists) {
        toast.error('Un compte existe déjà avec cet email');
        setIsLogin(true);
        return;
      }

      if (statusFilter === 'student') {
        const emailDomain = data.email.split('@')[1];

        if (!emailDomain) {
          toast.error('Email invalide');
          return;
        }

        const schoolResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/school-domains/check`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain: emailDomain }),
          },
        );

        const schoolResult = await schoolResponse.json();

        if (!schoolResponse.ok || !schoolResult.schoolId) {
          toast.error('Votre email doit être une adresse email étudiante valide');
          return;
        }

        data.schoolId = schoolResult.schoolId;
      }

      const endpoint =
        statusFilter === 'student'
          ? `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`
          : `${process.env.NEXT_PUBLIC_API_URL}/auth/company-signup`;

      const createUserResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          type: statusFilter === 'student' ? 'student' : 'company-owner',
          schoolId: statusFilter === 'student' ? data.schoolId : undefined,
          companyName: statusFilter === 'company' ? data.companyName : undefined,
        }),
      });

      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json();
        toast.error(errorData.error || "Une erreur est survenue lors de l'inscription");
        return;
      }

      const signInResult = await signIn('resend', {
        email: data.email,
        redirect: true,
      });

      if (signInResult?.error) {
        toast.error(signInResult.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription" + error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitLogin = async (data: LoginValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok || !result.exists) {
        toast.error('Aucun compte trouvé avec cet email');
        return;
      }

      const signInResult = await signIn('resend', {
        email: data.email,
        redirect: true,
      });

      if (signInResult?.error) {
        toast.error(signInResult.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { callbackUrl: '/' });
    } catch {
      toast.error('Une erreur est survenue lors de la connexion avec Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-medium ml-1 mb-2">{isLogin ? 'Se connecter' : "S'inscrire"}</h2>

      <Card className="w-full px-4 py-8 space-y-6">
        <CardContent className="px-0">
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
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

          <div className="relative mb-6">
            <Separator className="absolute top-1/2 w-full" />
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">OU</span>
            </div>
          </div>

          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between items-center mt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Envoi en cours...' : 'Se connecter'}
                  </Button>
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => setIsLogin(false)}
                    disabled={isLoading}
                  >
                    Pas encore inscrit ?
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              <Tabs defaultValue="student" className="w-full" onValueChange={setStatusFilter}>
                <div className="flex flex-col align-center mb-4 gap-2">
                  <label className="ml-1 font-medium">Profil</label>
                  <TabsList>
                    <TabsTrigger value="student">Étudiant</TabsTrigger>
                    <TabsTrigger value="company">Entreprise</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>

              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {statusFilter === 'company' ? (
                    <>
                      <FormField
                        control={registerForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l&apos;entreprise</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  field.onChange(e.target.files ? e.target.files[0] : null)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <FormField
                      control={registerForm.control}
                      name="cv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CV</FormLabel>
                          <FormControl className="cursor-pointer">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                field.onChange(e.target.files ? e.target.files[0] : null)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Envoi en cours...' : "S'inscrire"}
                    </Button>
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => setIsLogin(true)}
                      disabled={isLoading}
                    >
                      Déjà inscrit ?
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}

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

export default LoginForm;
