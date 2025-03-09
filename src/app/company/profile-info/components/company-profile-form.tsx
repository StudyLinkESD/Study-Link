'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

// Schéma de validation pour le formulaire
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  logo: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof formSchema>;

interface CompanyProfileFormProps {
  company: Company;
}

export function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialiser le formulaire avec les valeurs existantes
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company.name || '',
      logo: company.logo || '',
    },
  });

  // Fonction pour soumettre le formulaire
  const onSubmit = async (data: CompanyFormValues) => {
    try {
      setIsLoading(true);

      // Appel API pour mettre à jour le profil de l'entreprise
      const response = await fetch(`/api/companies/${company.id}`, {
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
      router.push(`/company/${company.id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l&apos;entreprise</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
