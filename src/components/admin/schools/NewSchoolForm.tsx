'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { handleUploadFile } from '@/services/uploadFile';
import Image from 'next/image';

type SchoolCreate = {
  name: string;
  logo: string | null;
};

interface FormData {
  name: string;
  domain: string;
  logo: File | null;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
}

interface FormErrors {
  name?: string;
  domain?: string;
  logo?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerEmail?: string;
}

interface NewSchoolFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

interface CreateSchoolPayload {
  school: SchoolCreate;
  domain: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function NewSchoolForm({ onSuccess, onCancel }: NewSchoolFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    domain: '',
    logo: null,
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      setStep(2);
    } catch (error) {
      console.error('Erreur:', error);
      setFormErrors({ domain: 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerEmail || !formData.ownerFirstName || !formData.ownerLastName) {
      setFormErrors({
        ownerEmail: !formData.ownerEmail ? 'Email requis' : undefined,
        ownerFirstName: !formData.ownerFirstName ? 'Prénom requis' : undefined,
        ownerLastName: !formData.ownerLastName ? 'Nom requis' : undefined,
      });
      return;
    }
    setStep(3);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, logo: file || null }));
    setFormErrors((prev) => ({ ...prev, logo: undefined }));

    if (file) {
      const result = await handleUploadFile(e, 'studylink_images');

      if (!result) {
        setFormErrors((prev) => ({
          ...prev,
          logo: "Erreur lors de l'upload du fichier",
        }));
        e.target.value = '';
        setFormData((prev) => ({ ...prev, logo: null }));
        return;
      }

      if ('code' in result) {
        setFormErrors((prev) => ({
          ...prev,
          logo: result.message,
        }));
        e.target.value = '';
        setFormData((prev) => ({ ...prev, logo: null }));
        return;
      }

      setLogoUrl(result.fileUrl);
    } else {
      setLogoUrl(null);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const payload: CreateSchoolPayload = {
        school: {
          name: formData.name,
          logo: logoUrl,
        },
        domain: formData.domain,
        owner: {
          firstName: formData.ownerFirstName,
          lastName: formData.ownerLastName,
          email: formData.ownerEmail,
        },
      };

      const response = await fetch('/api/schools/create-with-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Erreur de réponse:', data);

        switch (data.error) {
          case 'DOMAIN_EXISTS':
            setFormErrors({ domain: 'Ce domaine est déjà utilisé par une autre école' });
            setStep(1);
            return;
          case 'USER_EXISTS':
            setFormErrors({ ownerEmail: 'Un utilisateur avec cet email existe déjà' });
            setStep(2);
            return;
          case 'UNIQUE_CONSTRAINT_FAILED':
            if (data.details?.target?.includes('email')) {
              setFormErrors({ ownerEmail: 'Cet email est déjà utilisé' });
              setStep(2);
            } else if (data.details?.target?.includes('domain')) {
              setFormErrors({ domain: 'Ce domaine est déjà utilisé' });
              setStep(1);
            } else {
              setFormErrors({
                name: "Une erreur de contrainte unique s'est produite",
              });
            }
            return;
          default:
            setFormErrors({
              name: data.message || "Une erreur est survenue lors de la création de l'école",
            });
            return;
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setFormErrors({
        name:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la création de l'école",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Ajouter une école</h2>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>

      <div className="max-w-2xl mx-auto mt-16">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Domaine</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Compte admin</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">École</span>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                className="bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleDomainSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine de l&apos;école</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="monecole.fr"
                    value={formData.domain}
                    onChange={(e) => {
                      setFormData({ ...formData, domain: e.target.value });
                      setFormErrors({});
                    }}
                    className={formErrors.domain ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.domain && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.domain}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Vérification...' : 'Étape suivante'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerFirstName">Prénom</Label>
                  <Input
                    id="ownerFirstName"
                    type="text"
                    value={formData.ownerFirstName}
                    onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                    className={formErrors.ownerFirstName ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.ownerFirstName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.ownerFirstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerLastName">Nom</Label>
                  <Input
                    id="ownerLastName"
                    type="text"
                    value={formData.ownerLastName}
                    onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                    className={formErrors.ownerLastName ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.ownerLastName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.ownerLastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className={formErrors.ownerEmail ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.ownerEmail && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.ownerEmail}</p>
                  )}
                </div>
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Étape suivante
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;école</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Mon École"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({});
                    }}
                    className={formErrors.name ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className={formErrors.logo ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {formErrors.logo && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.logo}</p>
                  )}
                  {logoUrl && (
                    <div className="mt-2">
                      <Image
                        src={logoUrl}
                        alt="Aperçu du logo"
                        className="w-20 h-20 object-contain"
                        width={80}
                        height={80}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                  >
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Création...' : "Créer l'école"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
