import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Phone, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useState } from 'react';

import ProfileFormActions from './ProfileFormAction';
import ProfileFormField from './ProfileFormField';
import ProfileFormLayout from './ProfileFormLayout';
import ProfileFormSection from './ProfileFormSection';
import ProfilePhotoUpload from './ProfilePhotoUpload';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom de l'école doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom de l'école ne doit pas dépasser 100 caractères" }),
  description: z
    .string()
    .min(100, { message: 'La description doit contenir au moins 100 caractères' })
    .max(1000, { message: 'La description ne doit pas dépasser 1000 caractères' }),
  address: z
    .string()
    .min(5, { message: "L'adresse doit contenir au moins 5 caractères" })
    .max(200, { message: "L'adresse ne doit pas dépasser 200 caractères" }),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, { message: 'Numéro de téléphone invalide' }),
  email: z.string().email({ message: 'Adresse email invalide' }),
  website: z.string().url({ message: 'URL invalide' }).optional().or(z.literal('')),
  type: z.enum(['Privé', 'Public', 'Consulaire'], {
    required_error: "Veuillez sélectionner le type d'école",
  }),
  specialties: z
    .array(z.string())
    .min(1, { message: 'Veuillez sélectionner au moins une spécialité' })
    .max(5, { message: 'Vous ne pouvez pas sélectionner plus de 5 spécialités' }),
  studentCount: z
    .string()
    .regex(/^\d+$/, { message: "Le nombre d'étudiants doit être un nombre" })
    .min(1, { message: "Veuillez entrer le nombre d'étudiants" }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SchoolProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
}

const availableSpecialties = [
  { value: 'informatique', label: 'Informatique' },
  { value: 'business', label: 'Business' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'engineering', label: 'Ingénierie' },
  { value: 'health', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
];

export default function SchoolProfileForm({
  initialData,
  onSubmit,
  onCancel,
}: SchoolProfileFormProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      type: 'Privé',
      specialties: [],
      studentCount: '',
      ...initialData,
    },
  });

  const handleLogoChange = (file: File | null, url?: string) => {
    setLogoUrl(url || null);
  };

  const tabs = [
    {
      id: 'general',
      label: 'Informations générales',
      content: (
        <div className="space-y-6">
          <ProfileFormSection title="Logo de l'école" icon={GraduationCap}>
            <ProfilePhotoUpload currentPhotoUrl={logoUrl} onPhotoChange={handleLogoChange} />
          </ProfileFormSection>

          <ProfileFormSection title="Informations de base" icon={GraduationCap}>
            <div className="space-y-6">
              <ProfileFormField
                type="text"
                label="Nom de l'école"
                name="name"
                value={watch('name')}
                onChange={(value) => (control._formValues.name = value)}
                error={errors.name?.message}
                required
              />
              <ProfileFormField
                type="textarea"
                label="Description"
                name="description"
                value={watch('description')}
                onChange={(value) => (control._formValues.description = value)}
                error={errors.description?.message}
                required
                placeholder="Décrivez votre école, ses programmes et sa pédagogie"
              />
              <ProfileFormField
                type="select"
                label="Type d'école"
                name="type"
                value={watch('type')}
                onChange={(value) => (control._formValues.type = value as ProfileFormData['type'])}
                error={errors.type?.message}
                required
                options={[
                  { value: 'Privé', label: 'Privé' },
                  { value: 'Public', label: 'Public' },
                  { value: 'Consulaire', label: 'Consulaire' },
                ]}
              />
              <ProfileFormField
                type="text"
                label="Nombre d'étudiants"
                name="studentCount"
                value={watch('studentCount')}
                onChange={(value) => (control._formValues.studentCount = value)}
                error={errors.studentCount?.message}
                required
                placeholder="Ex: 1000"
              />
            </div>
          </ProfileFormSection>

          <ProfileFormSection title="Spécialités" icon={Users}>
            <div className="space-y-4">
              {availableSpecialties.map((specialty) => (
                <div key={specialty.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={specialty.value}
                    checked={watch('specialties').includes(specialty.value)}
                    onChange={(e) => {
                      const currentSpecialties = watch('specialties');
                      const newSpecialties = e.target.checked
                        ? [...currentSpecialties, specialty.value]
                        : currentSpecialties.filter((s) => s !== specialty.value);
                      control._formValues.specialties = newSpecialties;
                    }}
                    className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={specialty.value} className="text-sm font-medium">
                    {specialty.label}
                  </label>
                </div>
              ))}
              {errors.specialties && (
                <p className="text-sm text-red-500">{errors.specialties.message}</p>
              )}
            </div>
          </ProfileFormSection>
        </div>
      ),
    },
    {
      id: 'contact',
      label: 'Coordonnées',
      content: (
        <div className="space-y-6">
          <ProfileFormSection title="Informations de contact" icon={Phone}>
            <div className="space-y-6">
              <ProfileFormField
                type="text"
                label="Adresse"
                name="address"
                value={watch('address')}
                onChange={(value) => (control._formValues.address = value)}
                error={errors.address?.message}
                required
                placeholder="Adresse complète de l'école"
              />
              <ProfileFormField
                type="text"
                label="Téléphone"
                name="phone"
                value={watch('phone')}
                onChange={(value) => (control._formValues.phone = value)}
                error={errors.phone?.message}
                required
                placeholder="Ex: +33 1 23 45 67 89"
              />
              <ProfileFormField
                type="text"
                label="Email"
                name="email"
                value={watch('email')}
                onChange={(value) => (control._formValues.email = value)}
                error={errors.email?.message}
                required
                placeholder="contact@ecole.com"
              />
              <ProfileFormField
                type="text"
                label="Site web"
                name="website"
                value={watch('website')}
                onChange={(value) => (control._formValues.website = value)}
                error={errors.website?.message}
                placeholder="https://www.ecole.com"
              />
            </div>
          </ProfileFormSection>
        </div>
      ),
    },
  ];

  const completionFields = [
    { label: 'Logo', completed: !!logoUrl },
    { label: "Nom de l'école", completed: !!watch('name') },
    { label: 'Description', completed: !!watch('description') },
    { label: "Type d'école", completed: !!watch('type') },
    { label: "Nombre d'étudiants", completed: !!watch('studentCount') },
    { label: 'Spécialités', completed: (watch('specialties')?.length || 0) > 0 },
    { label: 'Adresse', completed: !!watch('address') },
    { label: 'Téléphone', completed: !!watch('phone') },
    { label: 'Email', completed: !!watch('email') },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ProfileFormLayout tabs={tabs} completionFields={completionFields}>
        <ProfileFormActions
          onSubmit={handleSubmit(onSubmit)}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isDirty={Object.keys(dirtyFields).length > 0}
        />
      </ProfileFormLayout>
    </form>
  );
}
