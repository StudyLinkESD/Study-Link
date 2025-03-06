import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, School, Briefcase } from 'lucide-react';
import ProfileFormLayout from './ProfileFormLayout';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import FormSection from '@/components/app/profileForm/FormSection';
import FormField from '@/components/app/profileForm/FormField';
import NavigationButton from '@/components/app/profileForm/NavigationButton';
import SkillsSelector from '@/components/app/profileForm/SkillsSelector';
import FileUploadInput from '@/components/app/common/FileUploadInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le prénom ne doit pas dépasser 50 caractères' })
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, {
      message: 'Le prénom ne doit contenir que des lettres, espaces et tirets',
    }),
  lastName: z
    .string()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le nom ne doit pas dépasser 50 caractères' })
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, {
      message: 'Le nom ne doit contenir que des lettres, espaces et tirets',
    }),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    required_error: 'Veuillez sélectionner votre statut',
  }),
  school: z.string().min(1, { message: 'Veuillez sélectionner votre école' }),
  availability: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/20[2-9][0-9]$/, {
      message: 'Format attendu : MM/YYYY (ex: 09/2024)',
    })
    .optional()
    .or(z.literal('')),
  alternanceRhythm: z
    .string()
    .min(5, { message: "Veuillez décrire votre rythme d'alternance" })
    .max(100, { message: 'La description du rythme est trop longue' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(100, { message: 'La description doit contenir au moins 100 caractères' })
    .max(500, { message: 'La description ne doit pas dépasser 500 caractères' })
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string())
    .min(3, { message: 'Veuillez sélectionner au moins 3 compétences' })
    .max(10, { message: 'Vous ne pouvez pas sélectionner plus de 10 compétences' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface StudentProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  schools: { id: string; name: string }[];
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
}

const availableSkills = [
  { id: 'react', name: 'React' },
  { id: 'nextjs', name: 'Next.js' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'tailwind', name: 'TailwindCSS' },
  { id: 'nodejs', name: 'Node.js' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'php', name: 'PHP' },
  { id: 'csharp', name: 'C#' },
];

export default function StudentProfileForm({
  initialData,
  schools,
  onSubmit,
  onCancel,
}: StudentProfileFormProps) {
  const [uploadedCv, setUploadedCv] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      status: 'ACTIVE',
      school: '',
      availability: '',
      alternanceRhythm: '',
      description: '',
      skills: [],
      ...initialData,
    },
  });

  const handleCvChange = (file: File | null) => {
    setUploadedCv(file);
  };

  const tabs = [
    {
      id: 'personal',
      label: 'Informations personnelles',
      content: (
        <div className="space-y-6">
          <FormSection title="Photo de profil" icon={User}>
            <ProfileAvatar
              photoUrl={undefined}
              firstName={watch('firstName') || ''}
              lastName={watch('lastName') || ''}
              size="lg"
            />
          </FormSection>

          <FormSection title="Informations de base" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Prénom"
                htmlFor="firstName"
                required
                error={errors.firstName?.message}
                touched={!!watch('firstName')}
                isValid={!errors.firstName && !!watch('firstName')}
              >
                <Input
                  id="firstName"
                  value={watch('firstName')}
                  onChange={(e) => (control._formValues.firstName = e.target.value)}
                  placeholder="Votre prénom"
                />
              </FormField>
              <FormField
                label="Nom"
                htmlFor="lastName"
                required
                error={errors.lastName?.message}
                touched={!!watch('lastName')}
                isValid={!errors.lastName && !!watch('lastName')}
              >
                <Input
                  id="lastName"
                  value={watch('lastName')}
                  onChange={(e) => (control._formValues.lastName = e.target.value)}
                  placeholder="Votre nom"
                />
              </FormField>
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      id: 'professional',
      label: 'Informations professionnelles',
      content: (
        <div className="space-y-6">
          <FormSection title="Statut et école" icon={School}>
            <div className="space-y-6">
              <FormField
                label="Statut"
                htmlFor="status"
                required
                error={errors.status?.message}
                touched={!!watch('status')}
                isValid={!errors.status && !!watch('status')}
              >
                <RadioGroup
                  id="status"
                  value={watch('status')}
                  onValueChange={(value) =>
                    (control._formValues.status = value as 'ACTIVE' | 'INACTIVE')
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ACTIVE" id="active" />
                    <label htmlFor="active">Actif</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INACTIVE" id="inactive" />
                    <label htmlFor="inactive">Inactif</label>
                  </div>
                </RadioGroup>
              </FormField>
              <FormField
                label="École"
                htmlFor="school"
                required
                error={errors.school?.message}
                touched={!!watch('school')}
                isValid={!errors.school && !!watch('school')}
              >
                <Select
                  value={watch('school')}
                  onValueChange={(value) => (control._formValues.school = value)}
                >
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Sélectionnez votre école" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Disponibilité et rythme" icon={Briefcase}>
            <div className="space-y-6">
              <FormField
                label="Date de disponibilité"
                htmlFor="availability"
                error={errors.availability?.message}
                touched={!!watch('availability')}
                isValid={!errors.availability && !!watch('availability')}
                hint="Format: MM/YYYY"
              >
                <Input
                  id="availability"
                  value={watch('availability') || ''}
                  onChange={(e) => (control._formValues.availability = e.target.value)}
                  placeholder="MM/YYYY"
                />
              </FormField>
              <FormField
                label="Rythme d'alternance"
                htmlFor="alternanceRhythm"
                error={errors.alternanceRhythm?.message}
                touched={!!watch('alternanceRhythm')}
                isValid={!errors.alternanceRhythm && !!watch('alternanceRhythm')}
                hint="Ex: 3 jours en entreprise, 2 jours à l'école"
              >
                <Textarea
                  id="alternanceRhythm"
                  value={watch('alternanceRhythm') || ''}
                  onChange={(e) => (control._formValues.alternanceRhythm = e.target.value)}
                  placeholder="Décrivez votre rythme d'alternance"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Compétences" icon={Briefcase}>
            <SkillsSelector
              selectedSkills={watch('skills')}
              onChange={(skills) => (control._formValues.skills = skills)}
              error={errors.skills?.message}
              availableSkills={availableSkills}
            />
          </FormSection>

          <FormSection title="CV" icon={Briefcase}>
            <FileUploadInput
              id="cv"
              onChange={handleCvChange}
              accept=".pdf,.doc,.docx"
              hint="Formats acceptés : PDF, DOC, DOCX"
            />
          </FormSection>
        </div>
      ),
    },
  ];

  const completionFields = [
    { label: 'Informations personnelles', completed: !!watch('firstName') && !!watch('lastName') },
    { label: 'Statut', completed: !!watch('status') },
    { label: 'École', completed: !!watch('school') },
    { label: 'Compétences', completed: (watch('skills')?.length || 0) >= 3 },
    { label: 'CV', completed: !!uploadedCv },
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
