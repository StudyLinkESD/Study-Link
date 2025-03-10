'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import BackButton from '@/components/app/common/BackButton';
import FileUploadInput from '@/components/app/common/FileUploadInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  logo: z.string().optional(),
  description: z.string().optional(),
  website: z
    .string()
    .url({
      message: 'Veuillez entrer une URL valide.',
    })
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email({
      message: 'Veuillez entrer une adresse email valide.',
    })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof formSchema>;

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      description: '',
      website: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Entreprise introuvable');
            router.push('/company');
            return;
          }
          throw new Error("Erreur lors de la récupération des données de l'entreprise");
        }

        const data = await response.json();

        form.reset({
          name: data.name || '',
          logo: data.logo || '',
          description: data.description || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setInitialLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, form, router]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la mise à jour du profil.');
      }

      toast.success('Profil mis à jour avec succès !');
      router.push(`/company/${companyId}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 border-t-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <BackButton href={`/company/${companyId}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le profil de l&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo de l&apos;entreprise</FormLabel>
                        <FormControl>
                          <FileUploadInput
                            id="company-logo"
                            accept="image/*"
                            preview={field.value || ''}
                            previewType="avatar"
                            onChange={(_, url) => {
                              if (url) field.onChange(url);
                            }}
                            hint="Format recommandé: PNG ou JPG, carré."
                          />
                        </FormControl>
                        <FormDescription>
                          Le logo de votre entreprise. Format recommandé: PNG ou JPG, carré.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l&apos;entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'entreprise" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le nom de votre entreprise tel qu&apos;il apparaîtra sur la plateforme.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} />
                      </FormControl>
                      <FormDescription>Le site web de votre entreprise.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        L&apos;adresse email de contact de votre entreprise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le numéro de téléphone de contact de votre entreprise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="123 rue Example, 75000 Paris" {...field} />
                      </FormControl>
                      <FormDescription>L&apos;adresse de votre entreprise.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre entreprise, ses activités, sa mission, etc."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Une description détaillée de votre entreprise.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
