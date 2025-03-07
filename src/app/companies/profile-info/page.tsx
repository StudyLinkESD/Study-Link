'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SectionCard from '@/components/app/common/SectionCard';
import FormField from '@/components/app/profileForm/FormField';
import FileUploadInput from '@/components/app/common/FileUploadInput';
import NavigationButtons from '@/components/app/profileForm/NavigationButton';
import { Company } from '@prisma/client';
import { uploadFileToSupabase } from '@/services/uploadFile';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom de l'entreprise doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom de l'entreprise ne doit pas dépasser 100 caractères" }),
});

type FormData = z.infer<typeof profileSchema>;

export default function CompanyProfileForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
  });

  const getCompanyByUserId = async (userId: string): Promise<Company | null> => {
    try {
      const response = await fetch(`/api/companies/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur ${response.status} lors de la récupération de l'entreprise`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'entreprise:", error);
      return null;
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const result = await uploadFileToSupabase(file, 'studylink_images');
      if (!result || 'error' in result || !('fileUrl' in result)) {
        throw new Error("Erreur lors de l'upload du logo");
      }
      return result.fileUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload du logo:", error);
      throw error;
    }
  };

  const createCompany = async (data: FormData) => {
    try {
      let logo = null;
      if (uploadedLogo) {
        const logoUrl = await uploadLogo(uploadedLogo);
        if (logoUrl) {
          // Créer une entrée dans la table UploadFile
          const uploadResponse = await fetch('/api/upload-files', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileUrl: logoUrl,
            }),
          });
          if (!uploadResponse.ok) {
            throw new Error("Erreur lors de la création de l'entrée du fichier");
          }
          const uploadData = await uploadResponse.json();
          logo = uploadData.uuid;
        }
      }

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: data.name,
          logo: logo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du profil entreprise');
      }

      return response.json();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, data: FormData) => {
    try {
      let logo = null;
      if (uploadedLogo) {
        const logoUrl = await uploadLogo(uploadedLogo);
        if (logoUrl) {
          // Créer une entrée dans la table UploadFile
          const uploadResponse = await fetch('/api/upload-files', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileUrl: logoUrl,
            }),
          });
          if (!uploadResponse.ok) {
            throw new Error("Erreur lors de la création de l'entrée du fichier");
          }
          const uploadData = await uploadResponse.json();
          logo = uploadData.uuid;
        }
      }

      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          logo: logo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil entreprise');
      }

      return response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  useEffect(() => {
    const userId = session?.user?.id;
    if (status === 'authenticated' && userId) {
      const loadCompanyProfile = async () => {
        try {
          const companyData = await getCompanyByUserId(userId);

          if (companyData) {
            setCompanyId(companyData.id);
            reset({
              name: companyData.name,
            });

            // Charger le logo si disponible
            if (companyData.logo) {
              const logoResponse = await fetch(`/api/upload-files/${companyData.logo}`);
              if (logoResponse.ok) {
                const logoData = await logoResponse.json();
                setLogoUrl(logoData.fileUrl);
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadCompanyProfile();
    } else {
      setIsLoading(false);
    }
  }, [status, session, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (companyId) {
        await updateCompany(companyId, data);
        toast.success('Profil mis à jour avec succès');
      } else {
        await createCompany(data);
        toast.success('Profil créé avec succès');
      }
      router.push('/companies/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde');
    }
  };

  const handleLogoChange = (file: File | null) => {
    if (file) {
      setUploadedLogo(file);
      // TODO: Implémenter l'upload du logo
      console.log('Logo à uploader:', file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profil entreprise</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard title="Informations de l'entreprise" icon={Building2}>
            <div className="space-y-6">
              <FormField
                label="Nom de l'entreprise"
                htmlFor="name"
                required
                error={errors.name?.message}
                touched={!!watch('name')}
                isValid={!errors.name && !!watch('name')}
              >
                <Input id="name" {...register('name')} placeholder="Nom de votre entreprise" />
              </FormField>

              <FormField
                label="Logo"
                htmlFor="logoUpload"
                className="mt-4"
                hint="Format recommandé : JPG ou PNG, 500x500px minimum"
              >
                <FileUploadInput
                  id="logoUpload"
                  accept="image/*"
                  onChange={handleLogoChange}
                  preview={logoUrl}
                  previewType="avatar"
                />
              </FormField>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <NavigationButtons showSubmitButton onSubmit={true} isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  );
}
