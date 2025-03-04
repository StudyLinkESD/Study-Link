'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { User, School, Briefcase, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionCard from '@/components/app/common/SectionCard';
import FormField from '@/components/app/form/FormField';
import ProfilePreview from '@/components/app/form/ProfilePreview';
import FileUploadField from '@/components/app/common/FileUploadInput';
import SkillsSelector from '@/components/app/form/SkillsSelector';
import NavigationButtons from '@/components/app/form/NavigationButton';

const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
  lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  status: z.enum(['Alternant', 'Stagiaire'], {
    required_error: 'Veuillez sélectionner votre statut',
  }),
  school: z.string().min(2, { message: 'Veuillez indiquer votre école' }),
  availability: z.string().optional(),
  alternanceRhythm: z.string().optional(),
  description: z
    .string()
    .max(500, {
      message: 'La description ne doit pas dépasser 500 caractères',
    })
    .optional(),
  skills: z.array(z.string()).min(1, {
    message: 'Veuillez sélectionner au moins une compétence',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function StudentProfileForm() {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadedCv, setUploadedCv] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState('personal');
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
  const schools = [
    { id: 'esgi', name: 'ESGI' },
    { id: 'epita', name: 'EPITA' },
    { id: 'epitech', name: 'Epitech' },
    { id: 'hetic', name: 'HETIC' },
    { id: 'supinfo', name: 'Supinfo' },
  ];

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      status: 'Alternant',
      school: '',
      availability: '',
      alternanceRhythm: '',
      description: '',
      skills: [],
    },
  });

  const formValues = watch();
  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhotoUrl(imageUrl);
    }
  };

  const handleCvUpload = (file: File | null) => {
    if (file) {
      setUploadedCv(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const completeData = {
        ...data,
        photoUrl,
        cvUrl: uploadedCv ? uploadedCv.name : null,
      };

      console.log('Données du profil soumises:', completeData);
      router.push('/students/profile');
    } catch (error) {
      console.error('Erreur lors de la soumission du profil:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Compléter votre profil</h1>
      <p className="text-muted-foreground mb-8">
        Ces informations seront visibles par les entreprises et vous permettront de recevoir des
        offres correspondant à votre profil.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="sticky top-6 space-y-6">
              <ProfilePreview
                firstName={formValues.firstName}
                lastName={formValues.lastName}
                photoUrl={photoUrl}
                status={formValues.status as 'Alternant' | 'Stagiaire'}
                school={formValues.school}
                alternanceRhythm={formValues.alternanceRhythm}
                availability={formValues.availability}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Enregistrement...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer le profil
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="md:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
                <TabsTrigger value="education">Formation</TabsTrigger>
                <TabsTrigger value="skills">Compétences</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6 mt-6">
                <SectionCard title="Informations de base" icon={User}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Prénom"
                      htmlFor="firstName"
                      required
                      error={errors.firstName?.message}
                    >
                      <Input id="firstName" placeholder="Votre prénom" {...register('firstName')} />
                    </FormField>

                    <FormField
                      label="Nom"
                      htmlFor="lastName"
                      required
                      error={errors.lastName?.message}
                    >
                      <Input id="lastName" placeholder="Votre nom" {...register('lastName')} />
                    </FormField>
                  </div>

                  <FormField
                    label="Photo de profil"
                    htmlFor="photoUpload"
                    className="mt-4"
                    hint="Format recommandé : JPG ou PNG, 500x500px minimum"
                  >
                    <FileUploadField
                      id="photoUpload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      preview={photoUrl}
                      previewType="avatar"
                      firstName={formValues.firstName}
                      lastName={formValues.lastName}
                    />
                  </FormField>

                  <FormField
                    label="Statut"
                    htmlFor="status"
                    required
                    className="mt-4"
                    error={errors.status?.message}
                  >
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Alternant" id="alternant" />
                            <Label htmlFor="alternant">Alternant</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Stagiaire" id="stagiaire" />
                            <Label htmlFor="stagiaire">Stagiaire</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    htmlFor="description"
                    className="mt-4"
                    hint={`${formValues.description?.length || 0}/500 caractères`}
                    error={errors.description?.message}
                  >
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre parcours, vos projets et vos aspirations professionnelles..."
                      className="min-h-[120px]"
                      {...register('description')}
                    />
                  </FormField>
                </SectionCard>
                <NavigationButtons showNextButton onNext={() => setSelectedTab('education')} />
              </TabsContent>

              <TabsContent value="education" className="space-y-6 mt-6">
                <SectionCard title="Formation et disponibilité" icon={School}>
                  <div className="space-y-4">
                    <FormField
                      label="École"
                      htmlFor="school"
                      required
                      error={errors.school?.message}
                    >
                      <Controller
                        control={control}
                        name="school"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre école" />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem key={school.id} value={school.name}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>

                    {formValues.status === 'Alternant' && (
                      <FormField label="Rythme d'alternance" htmlFor="alternanceRhythm">
                        <Input
                          id="alternanceRhythm"
                          placeholder="Ex: 3 semaines entreprise / 1 semaine école"
                          {...register('alternanceRhythm')}
                        />
                      </FormField>
                    )}

                    <FormField
                      label="Disponibilité"
                      htmlFor="availability"
                      hint="Indiquez à partir de quand vous êtes disponible pour commencer"
                    >
                      <Input
                        id="availability"
                        placeholder="Ex: Septembre 2025"
                        {...register('availability')}
                      />
                    </FormField>

                    <FormField
                      label="CV (facultatif)"
                      htmlFor="cvUpload"
                      hint="Format accepté : PDF, Word (.doc, .docx)"
                    >
                      <FileUploadField
                        id="cvUpload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                      />
                    </FormField>
                  </div>
                </SectionCard>

                <NavigationButtons
                  showBackButton
                  showNextButton
                  onBack={() => setSelectedTab('personal')}
                  onNext={() => setSelectedTab('skills')}
                />
              </TabsContent>

              <TabsContent value="skills" className="space-y-6 mt-6">
                <SectionCard title="Compétences et expertises" icon={Briefcase}>
                  <FormField
                    label="Sélectionnez vos compétences"
                    htmlFor="skills"
                    required
                    error={errors.skills?.message}
                  >
                    <Controller
                      control={control}
                      name="skills"
                      render={({ field }) => (
                        <SkillsSelector
                          availableSkills={availableSkills}
                          selectedSkills={field.value}
                          onChange={field.onChange}
                          error={errors.skills?.message}
                        />
                      )}
                    />
                  </FormField>
                </SectionCard>

                <NavigationButtons
                  showBackButton
                  showSubmitButton
                  onBack={() => setSelectedTab('education')}
                  onSubmit
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </form>
    </div>
  );
}
