import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Mail, MapPin } from 'lucide-react';
import ProfileFormLayout from './ProfileFormLayout';
import FormSection from '@/components/app/profileForm/FormSection';
import FormField from '@/components/app/profileForm/FormField';
import NavigationButton from '@/components/app/profileForm/NavigationButton';
import FileUploadInput from '@/components/app/common/FileUploadInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: "Le nom de l'entreprise doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom de l'entreprise ne doit pas dépasser 100 caractères" }),
  siret: z
    .string()
    .regex(/^[0-9]{14}$/, { message: 'Le numéro SIRET doit contenir exactement 14 chiffres' }),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], {
    required_error: "Veuillez sélectionner la taille de l'entreprise",
  }),
  industry: z.string().min(1, { message: "Veuillez sélectionner le secteur d'activité" }),
  description: z
    .string()
    .min(100, { message: 'La description doit contenir au moins 100 caractères' })
    .max(1000, { message: 'La description ne doit pas dépasser 1000 caractères' }),
  email: z.string().email({ message: 'Adresse email invalide' }),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: 'Le numéro de téléphone doit contenir 10 chiffres' }),
  address: z.string().min(5, { message: "L'adresse doit contenir au moins 5 caractères" }),
  city: z.string().min(2, { message: 'La ville doit contenir au moins 2 caractères' }),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, { message: 'Le code postal doit contenir 5 chiffres' }),
  website: z.string().url({ message: 'URL invalide' }).optional().or(z.literal('')),
  logo: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CompanyProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
}

const industries = [
  { id: 'tech', name: 'Technologies' },
  { id: 'finance', name: 'Finance' },
  { id: 'healthcare', name: 'Santé' },
  { id: 'education', name: 'Éducation' },
  { id: 'retail', name: 'Commerce' },
  { id: 'manufacturing', name: 'Industrie' },
  { id: 'services', name: 'Services' },
  { id: 'other', name: 'Autre' },
];

export default function CompanyProfileForm({
  initialData,
  onSubmit,
  onCancel,
}: CompanyProfileFormProps) {
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      siret: '',
      size: '1-10',
      industry: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      website: '',
      logo: '',
      ...initialData,
    },
  });

  const handleLogoChange = (file: File | null) => {
    setUploadedLogo(file);
  };

  const tabs = [
    {
      id: 'company',
      label: 'Informations entreprise',
      content: (
        <div className="space-y-6">
          <FormSection title="Logo" icon={Building2}>
            <FileUploadInput
              id="logo"
              onChange={handleLogoChange}
              accept="image/*"
              hint="Formats acceptés : JPG, PNG, GIF"
            />
          </FormSection>

          <FormSection title="Informations de base" icon={Building2}>
            <div className="space-y-6">
              <FormField
                label="Nom de l'entreprise"
                htmlFor="companyName"
                required
                error={errors.companyName?.message}
                touched={!!watch('companyName')}
                isValid={!errors.companyName && !!watch('companyName')}
              >
                <Input
                  id="companyName"
                  value={watch('companyName')}
                  onChange={(e) => (control._formValues.companyName = e.target.value)}
                  placeholder="Nom de votre entreprise"
                />
              </FormField>
              <FormField
                label="Numéro SIRET"
                htmlFor="siret"
                required
                error={errors.siret?.message}
                touched={!!watch('siret')}
                isValid={!errors.siret && !!watch('siret')}
              >
                <Input
                  id="siret"
                  value={watch('siret')}
                  onChange={(e) => (control._formValues.siret = e.target.value)}
                  placeholder="14 chiffres"
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Taille"
                  htmlFor="size"
                  required
                  error={errors.size?.message}
                  touched={!!watch('size')}
                  isValid={!errors.size && !!watch('size')}
                >
                  <Select
                    value={watch('size')}
                    onValueChange={(value) =>
                      (control._formValues.size = value as ProfileFormData['size'])
                    }
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Sélectionnez la taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employés</SelectItem>
                      <SelectItem value="11-50">11-50 employés</SelectItem>
                      <SelectItem value="51-200">51-200 employés</SelectItem>
                      <SelectItem value="201-500">201-500 employés</SelectItem>
                      <SelectItem value="501-1000">501-1000 employés</SelectItem>
                      <SelectItem value="1000+">1000+ employés</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField
                  label="Secteur d'activité"
                  htmlFor="industry"
                  required
                  error={errors.industry?.message}
                  touched={!!watch('industry')}
                  isValid={!errors.industry && !!watch('industry')}
                >
                  <Select
                    value={watch('industry')}
                    onValueChange={(value) => (control._formValues.industry = value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Sélectionnez le secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField
                label="Description"
                htmlFor="description"
                required
                error={errors.description?.message}
                touched={!!watch('description')}
                isValid={!errors.description && !!watch('description')}
              >
                <Textarea
                  id="description"
                  value={watch('description')}
                  onChange={(e) => (control._formValues.description = e.target.value)}
                  placeholder="Décrivez votre entreprise"
                  rows={4}
                />
              </FormField>
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      id: 'contact',
      label: 'Informations de contact',
      content: (
        <div className="space-y-6">
          <FormSection title="Coordonnées" icon={Mail}>
            <div className="space-y-6">
              <FormField
                label="Email"
                htmlFor="email"
                required
                error={errors.email?.message}
                touched={!!watch('email')}
                isValid={!errors.email && !!watch('email')}
              >
                <Input
                  id="email"
                  type="email"
                  value={watch('email')}
                  onChange={(e) => (control._formValues.email = e.target.value)}
                  placeholder="email@entreprise.com"
                />
              </FormField>
              <FormField
                label="Téléphone"
                htmlFor="phone"
                required
                error={errors.phone?.message}
                touched={!!watch('phone')}
                isValid={!errors.phone && !!watch('phone')}
              >
                <Input
                  id="phone"
                  type="tel"
                  value={watch('phone')}
                  onChange={(e) => (control._formValues.phone = e.target.value)}
                  placeholder="0612345678"
                />
              </FormField>
              <FormField
                label="Site web"
                htmlFor="website"
                error={errors.website?.message}
                touched={!!watch('website')}
                isValid={!errors.website && !!watch('website')}
              >
                <Input
                  id="website"
                  type="url"
                  value={watch('website')}
                  onChange={(e) => (control._formValues.website = e.target.value)}
                  placeholder="https://www.entreprise.com"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Adresse" icon={MapPin}>
            <div className="space-y-6">
              <FormField
                label="Adresse"
                htmlFor="address"
                required
                error={errors.address?.message}
                touched={!!watch('address')}
                isValid={!errors.address && !!watch('address')}
              >
                <Input
                  id="address"
                  value={watch('address')}
                  onChange={(e) => (control._formValues.address = e.target.value)}
                  placeholder="Adresse complète"
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Ville"
                  htmlFor="city"
                  required
                  error={errors.city?.message}
                  touched={!!watch('city')}
                  isValid={!errors.city && !!watch('city')}
                >
                  <Input
                    id="city"
                    value={watch('city')}
                    onChange={(e) => (control._formValues.city = e.target.value)}
                    placeholder="Ville"
                  />
                </FormField>
                <FormField
                  label="Code postal"
                  htmlFor="postalCode"
                  required
                  error={errors.postalCode?.message}
                  touched={!!watch('postalCode')}
                  isValid={!errors.postalCode && !!watch('postalCode')}
                >
                  <Input
                    id="postalCode"
                    value={watch('postalCode')}
                    onChange={(e) => (control._formValues.postalCode = e.target.value)}
                    placeholder="75000"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>
        </div>
      ),
    },
  ];

  const completionFields = [
    {
      label: 'Informations entreprise',
      completed:
        !!watch('companyName') && !!watch('siret') && !!watch('size') && !!watch('industry'),
    },
    { label: 'Description', completed: !!watch('description') },
    { label: 'Email', completed: !!watch('email') },
    { label: 'Téléphone', completed: !!watch('phone') },
    { label: 'Adresse', completed: !!watch('address') && !!watch('city') && !!watch('postalCode') },
    { label: 'Logo', completed: !!uploadedLogo },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ProfileFormLayout tabs={tabs} completionFields={completionFields}>
        <NavigationButton
          onSubmit={true}
          onBack={onCancel}
          isSubmitting={isSubmitting}
          showBackButton={!!onCancel}
          showSubmitButton={true}
        />
      </ProfileFormLayout>
    </form>
  );
}
