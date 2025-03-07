'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Save, School, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import FileUploadInput from '@/components/app/common/FileUploadInput';
import SectionCard from '@/components/app/common/SectionCard';
import FormField from '@/components/app/profileForm/FormField';
import NavigationButtons from '@/components/app/profileForm/NavigationButton';
import ProfileCompletion from '@/components/app/profileForm/ProfileCompletion';
import ProfilePreview from '@/components/app/profileForm/ProfilePreview';
import SkillsSelector from '@/components/app/profileForm/SkillsSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';

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
  status: z.enum(['Alternant', 'Stagiaire'], {
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

interface School {
  id: string;
  name: string;
}

interface CreateStudentData {
  userId: string;
  schoolId: string;
  status: 'Alternant' | 'Stagiaire';
  skills: string;
  apprenticeshipRhythm: string | null;
  description: string;
  curriculumVitaeId: string | null;
  previousCompanies: string;
  availability: boolean;
}

export default function StudentProfileForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadedCv, setUploadedCv] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

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

  const [schools, setSchools] = useState([
    { id: 'esgi', name: 'ESGI' },
    { id: 'epita', name: 'EPITA' },
    { id: 'epitech', name: 'Epitech' },
    { id: 'hetic', name: 'HETIC' },
    { id: 'supinfo', name: 'Supinfo' },
  ]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, dirtyFields, touchedFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
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

  const getStudentByUserId = async (userId: string) => {
    try {
      const response = await fetch(`/api/students/students/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur ${response.status} lors de la récupération de l'étudiant`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'étudiant:", error);
      return null;
    }
  };

  const createStudent = async (data: CreateStudentData) => {
    const response = await fetch(`/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création du profil étudiant');
    }

    return response.json();
  };

  const updateStudent = async (id: string, data: CreateStudentData) => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil étudiant');
    }

    return response.json();
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools');
        if (response.ok) {
          const schoolsData = await response.json();
          setSchools(
            schoolsData.map((school: School) => ({
              id: school.id,
              name: school.name,
            })),
          );
        }
      } catch (error) {
        console.error('Erreur lors du chargement des écoles:', error);
      }
    };

    fetchSchools();

    if (status === 'authenticated' && session?.user?.id) {
      const loadStudentProfile = async () => {
        try {
          const studentData = await getStudentByUserId(session.user.id);

          if (studentData) {
            setStudentId(studentData.id);

            reset({
              firstName: session.user.name?.split(' ')[0] || '',
              lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
              status: studentData.status as 'Alternant' | 'Stagiaire',
              school: studentData.schoolId,
              availability: studentData.availability ? 'Disponible' : '',
              alternanceRhythm: studentData.apprenticeshipRhythm || '',
              description: studentData.description,
              skills: studentData.skills.split(',').map((s: string) => s.trim()),
            });

            if (session.user.image) {
              setPhotoUrl(session.user.image);
            } else if (studentData.user?.profilePicture) {
              setPhotoUrl(`/api/files/${studentData.user.profilePicture}`);
            }

            if (studentData.curriculumVitaeId) {
              console.log('CV déjà chargé:', studentData.curriculumVitaeId);
            }
          } else {
            if (session.user.name) {
              const names = session.user.name.split(' ');
              reset({
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                status: 'Alternant',
                school: '',
                skills: [],
              });
            }

            if (session.user.image) {
              setPhotoUrl(session.user.image);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          toast.error('Impossible de charger votre profil');
        } finally {
          setIsLoading(false);
        }
      };

      loadStudentProfile();
    } else {
      setIsLoading(false);
    }
  }, [status, session, router, reset]);

  const formValues = watch();

  const handlePhotoUpload = (file: File | null, url?: string) => {
    if (file) {
      const imageUrl = url || URL.createObjectURL(file);
      setPhotoUrl(imageUrl);
    }
  };

  const handleCvUpload = (file: File | null) => {
    if (file) {
      setUploadedCv(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) {
      toast.error('Vous devez être connecté pour enregistrer votre profil');
      return;
    }

    try {
      if (data.firstName || data.lastName) {
        try {
          await fetch(`/api/users/${session.user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
            }),
          });
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        }
      }

      const studentData = {
        userId: session.user.id,
        schoolId: data.school,
        status: data.status,
        skills: data.skills.join(', '),
        apprenticeshipRhythm: data.alternanceRhythm || null,
        description: data.description || '',
        curriculumVitaeId: uploadedCv ? uploadedCv.name : null,
        previousCompanies: '',
        availability: !!data.availability,
      };

      if (studentId) {
        await updateStudent(studentId, studentData);
        toast.success('Profil mis à jour avec succès');
      } else {
        const newStudent = await createStudent(studentData);
        setStudentId(newStudent.id);
        toast.success('Profil créé avec succès');
      }

      router.push(`/students/${studentId || 'profile'}`);
    } catch (error) {
      console.error('Erreur lors de la soumission du profil:', error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement du profil",
      );
    }
  };

  const getProfileCompletionFields = () => {
    return [
      {
        name: 'Nom et prénom',
        completed: !!(formValues.firstName && formValues.lastName),
        required: true,
      },
      {
        name: 'Photo de profil',
        completed: !!photoUrl,
        required: false,
      },
      {
        name: 'Statut',
        completed: !!formValues.status,
        required: true,
      },
      {
        name: 'École',
        completed: !!formValues.school,
        required: true,
      },
      {
        name: "Rythme d'alternance",
        completed: !!formValues.alternanceRhythm,
        required: formValues.status === 'Alternant',
      },
      {
        name: 'Description',
        completed: !!(formValues.description && formValues.description.length >= 100),
        required: false,
      },
      {
        name: 'Compétences',
        completed: !!(formValues.skills && formValues.skills.length >= 3),
        required: true,
      },
      {
        name: 'CV',
        completed: !!uploadedCv,
        required: false,
      },
      {
        name: 'Disponibilité',
        completed: !!formValues.availability,
        required: false,
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[400px] max-w-4xl items-center justify-center px-4 py-8">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Compléter votre profil</h1>
      <p className="text-muted-foreground mb-8">
        Ces informations seront visibles par les entreprises et vous permettront de recevoir des
        offres correspondant à votre profil.
      </p>

      <ProfileCompletion fields={getProfileCompletionFields()} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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

              <TabsContent value="personal" className="mt-6 space-y-6">
                <SectionCard title="Informations de base" icon={User}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Prénom"
                      htmlFor="firstName"
                      required
                      error={errors.firstName?.message}
                      touched={!!touchedFields.firstName}
                      isValid={!!dirtyFields.firstName && !errors.firstName}
                      helpText="Utilisez votre prénom légal tel qu'il apparaît sur vos documents officiels"
                    >
                      <Input
                        id="firstName"
                        placeholder="Votre prénom"
                        {...register('firstName')}
                        className={cn(
                          errors.firstName && 'border-destructive',
                          !errors.firstName && touchedFields.firstName && 'border-green-500',
                        )}
                      />
                    </FormField>

                    <FormField
                      label="Nom"
                      htmlFor="lastName"
                      required
                      error={errors.lastName?.message}
                      touched={!!touchedFields.lastName}
                      isValid={!!dirtyFields.lastName && !errors.lastName}
                      helpText="Utilisez votre nom de famille légal"
                    >
                      <Input
                        id="lastName"
                        placeholder="Votre nom"
                        {...register('lastName')}
                        className={cn(
                          errors.lastName && 'border-destructive',
                          !errors.lastName && touchedFields.lastName && 'border-green-500',
                        )}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Photo de profil"
                    htmlFor="photoUpload"
                    className="mt-4"
                    hint="Format recommandé : JPG ou PNG, 500x500px minimum"
                  >
                    <FileUploadInput
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
                    touched={!!touchedFields.description}
                    isValid={!!dirtyFields.description && !errors.description}
                    helpText="Décrivez votre parcours, vos projets et ce que vous recherchez. Une bonne description augmente vos chances d'être contacté."
                  >
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre parcours, vos projets et vos aspirations professionnelles..."
                      className={cn(
                        'min-h-[120px]',
                        errors.description && 'border-destructive',
                        !errors.description && touchedFields.description && 'border-green-500',
                      )}
                      {...register('description')}
                    />
                  </FormField>
                </SectionCard>
                <NavigationButtons showNextButton onNext={() => setSelectedTab('education')} />
              </TabsContent>

              <TabsContent value="education" className="mt-6 space-y-6">
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
                                <SelectItem key={school.id} value={school.id}>
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
                      hint="Format : MM/YYYY"
                      error={errors.availability?.message}
                      touched={!!touchedFields.availability}
                      isValid={!!dirtyFields.availability && !errors.availability}
                      helpText="Indiquez le mois et l'année à partir desquels vous serez disponible"
                    >
                      <Input
                        id="availability"
                        placeholder="09/2024"
                        {...register('availability')}
                        className={cn(
                          errors.availability && 'border-destructive',
                          !errors.availability && touchedFields.availability && 'border-green-500',
                        )}
                      />
                    </FormField>

                    <FormField
                      label="CV (facultatif)"
                      htmlFor="cvUpload"
                      hint="Format accepté : PDF"
                    >
                      <FileUploadInput id="cvUpload" accept=".pdf" onChange={handleCvUpload} />
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

              <TabsContent value="skills" className="mt-6 space-y-6">
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
