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

const registerSchema = z.object({
  firstname: z.string().min(2, 'Le prénom est requis'),
  lastname: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  companyName: z.string().optional(),
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

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      companyName: '',
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

      const createUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          companyName: data.companyName,
        }),
      });

      if (!createUserResponse.ok) {
        toast.error('Une erreur est survenue lors de l\'inscription');
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
      toast.error('Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitLogin = async (data: LoginValues) => {
    try {
      setIsLoading(true);
      const result = await signIn('resend', {
        email: data.email,
        redirect: true,
      });

      if (result?.error) {
        toast.error(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-medium ml-1 mb-2">{isLogin ? 'Se connecter' : 'S\'inscrire'}</h2>

      <Card className="w-full px-4 py-8 space-y-6">
        <CardContent className="px-0">
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
                            <FormLabel>Nom de l'entreprise</FormLabel>
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
                      {isLoading ? 'Envoi en cours...' : 'S\'inscrire'}
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
        </CardContent>
      </Card>
    </>
  );
};

export default LoginForm;
