'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Briefcase, Save, School, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import FileUploadInput from '@/components/app/common/FileUploadInput';
import SectionCard from '@/components/app/common/SectionCard';
import ExperienceForm from '@/components/app/profileForm/ExperienceForm';
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

import { CreateStudentData, ExperienceDTO } from '@/dto/student.dto';
import { validateSchoolEmail } from '@/services/school.service';
import { updateStudentExperiences } from '@/services/student.service';
import { handleUploadFile } from '@/services/uploadFile';

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
  availability: z.boolean().default(true),
  alternanceRhythm: z
    .string()
    .min(5, { message: "Veuillez décrire votre rythme d'alternance" })
    .max(100, { message: 'La description du rythme est trop longue' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(20, { message: 'La description doit contenir au moins 20 caractères' })
    .max(500, { message: 'La description ne doit pas dépasser 500 caractères' })
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string())
    .min(3, { message: 'Veuillez sélectionner au moins 3 compétences' })
    .max(10, { message: 'Vous ne pouvez pas sélectionner plus de 10 compétences' }),
  previousCompanies: z.string().optional().or(z.literal('')),
  schoolEmail: z.string().email('Veuillez entrer un email valide'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface School {
  id: string;
  name: string;
}

interface ErrorDetail {
  message: string;
}

export const dynamic = 'force-dynamic';

export default function StudentProfileForm() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudentProfileContent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="container mx-auto flex min-h-[400px] max-w-4xl items-center justify-center px-4 py-8">
      <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
    </div>
  );
}

type SimpleExperience = {
  id: string;
  company: string;
  position: string;
  period: string;
  type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
  startDate?: Date;
  endDate?: Date;
};

function StudentProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadedCv, setUploadedCv] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<SimpleExperience[]>([]);

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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      status: 'Alternant',
      school: '',
      availability: true,
      alternanceRhythm: '',
      description: '',
      skills: [],
      previousCompanies: '',
      schoolEmail: '',
    },
  });

  const getStudentById = async (id: string) => {
    try {
      const response = await fetch(`/api/students/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur ${response.status} lors de la récupération de l'étudiant`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'étudiant:", error);
      return null;
    }
  };

  const getStudentByUserId = async (userId: string) => {
    try {
      const response = await fetch(`/api/students/user/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur ${response.status} lors de la récupération de l'étudiant`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'étudiant:", error);
      return null;
    }
  };

  const createStudent = async (data: CreateStudentData) => {
    try {
      const response = await fetch(`/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Réponse d'erreur du serveur:", responseData);
        if (responseData.details) {
          console.error('Détails des erreurs:', responseData.details);
          throw new Error(responseData.details.map((d: ErrorDetail) => d.message).join(', '));
        }
        throw new Error(responseData.error || 'Erreur lors de la création du profil étudiant');
      }

      return responseData;
    } catch (error) {
      console.error('Erreur détaillée dans createStudent:', error);
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la création de l'étudiant: ${error.message}`);
      }
      throw error;
    }
  };

  const updateStudent = async (id: string, data: CreateStudentData) => {
    try {
      const updateData = {
        status: data.status,
        skills: data.skills,
        apprenticeshipRhythm: data.apprenticeshipRhythm,
        description: data.description,
        curriculumVitae: data.curriculumVitae,
        previousCompanies: data.previousCompanies,
        availability: data.availability,
      };

      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Réponse d'erreur du serveur:", errorData);
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil étudiant');
      }

      return response.json();
    } catch (error) {
      console.error('Erreur dans updateStudent:', error);
      throw error;
    }
  };

  const fetchSchools = useCallback(async () => {
    try {
      const response = await fetch('/api/schools');
      if (response.ok) {
        const schoolsData = await response.json();
        setSchools(schoolsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des écoles:', error);
    }
  }, []);

  const loadStudentProfile = useCallback(async () => {
    const studentIdFromUrl = searchParams.get('studentId');

    const studentIdFromSession = session?.user?.studentId;

    const id = studentIdFromUrl || studentIdFromSession;

    if (id) {
      setStudentId(id);
      try {
        const studentData = await getStudentById(id);

        if (studentData) {
          setPhotoUrl(studentData.user?.profilePicture || '');
          setCvUrl(studentData.curriculumVitae || '');

          if (studentData.experiences && studentData.experiences.length > 0) {
            const structuredExperiences = studentData.experiences.map((exp: SimpleExperience) => {
              const startDate = exp.startDate ? new Date(exp.startDate) : undefined;
              const endDate = exp.endDate ? new Date(exp.endDate) : undefined;

              const startDateStr = startDate ? format(startDate, 'MMMM yyyy', { locale: fr }) : '';
              const endDateStr = endDate ? format(endDate, 'MMMM yyyy', { locale: fr }) : 'Présent';
              const period =
                startDateStr && (endDateStr || 'Présent') ? `${startDateStr} - ${endDateStr}` : '';

              return {
                id: exp.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
                company: exp.company,
                position: exp.position,
                period: period,
                type: exp.type as 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre',
                startDate,
                endDate,
              };
            });

            setExperiences(structuredExperiences);
          } else {
            const oldExperiences = studentData.previousCompanies
              ? studentData.previousCompanies
                  .split(',')
                  .map((company: string, index: number) => ({
                    id: `exp-${index}`,
                    company: company.trim(),
                    position: 'Stage/Alternance',
                    period: 'Non spécifié',
                    type: 'Stage' as const,
                  }))
                  .filter((exp: SimpleExperience) => exp.company)
              : [];

            setExperiences(oldExperiences);
          }

          form.reset({
            firstName: studentData.user?.firstName || '',
            lastName: studentData.user?.lastName || '',
            status: studentData.status || 'Alternant',
            school: studentData.schoolId || '',
            availability: studentData.availability !== undefined ? studentData.availability : true,
            alternanceRhythm: studentData.apprenticeshipRhythm || '',
            description: studentData.description || '',
            skills: studentData.skills
              ? studentData.skills.split(',').map((s: string) => s.trim())
              : [],
            previousCompanies: studentData.previousCompanies || '',
            schoolEmail: studentData.studentEmail || '',
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil de l'étudiant:", error);
      }
    } else if (session?.user?.id) {
      try {
        const studentData = await getStudentByUserId(session.user.id);

        if (studentData) {
          setStudentId(studentData.id);

          setPhotoUrl(studentData.user?.profilePicture || '');
          setCvUrl(studentData.curriculumVitae || '');

          if (studentData.experiences && studentData.experiences.length > 0) {
            const structuredExperiences = studentData.experiences.map((exp: SimpleExperience) => {
              const startDate = exp.startDate ? new Date(exp.startDate) : undefined;
              const endDate = exp.endDate ? new Date(exp.endDate) : undefined;

              const startDateStr = startDate ? format(startDate, 'MMMM yyyy', { locale: fr }) : '';
              const endDateStr = endDate ? format(endDate, 'MMMM yyyy', { locale: fr }) : 'Présent';
              const period =
                startDateStr && (endDateStr || 'Présent') ? `${startDateStr} - ${endDateStr}` : '';

              return {
                id: exp.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
                company: exp.company,
                position: exp.position,
                period: period,
                type: exp.type as 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre',
                startDate,
                endDate,
              };
            });

            setExperiences(structuredExperiences);
          } else {
            const oldExperiences = studentData.previousCompanies
              ? studentData.previousCompanies
                  .split(',')
                  .map((company: string, index: number) => ({
                    id: `exp-${index}`,
                    company: company.trim(),
                    position: 'Stage/Alternance',
                    period: 'Non spécifié',
                    type: 'Stage' as const,
                  }))
                  .filter((exp: SimpleExperience) => exp.company)
              : [];

            setExperiences(oldExperiences);
          }

          form.reset({
            firstName: studentData.user?.firstName || '',
            lastName: studentData.user?.lastName || '',
            status: studentData.status || 'Alternant',
            school: studentData.schoolId || '',
            availability: studentData.availability !== undefined ? studentData.availability : true,
            alternanceRhythm: studentData.apprenticeshipRhythm || '',
            description: studentData.description || '',
            skills: studentData.skills
              ? studentData.skills.split(',').map((s: string) => s.trim())
              : [],
            previousCompanies: studentData.previousCompanies || '',
            schoolEmail: studentData.studentEmail || '',
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil de l'utilisateur:", error);
      }
    }

    setIsLoading(false);
  }, [searchParams, session?.user?.id, session?.user?.studentId, form]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchSchools();
    loadStudentProfile();
  }, [status, router, fetchSchools, loadStudentProfile]);

  useEffect(() => {
    if (experiences.length > 0) {
      const companiesString = experiences.map((exp) => exp.company).join(', ');
      form.setValue('previousCompanies', companiesString);
    }
  }, [experiences, form]);

  const formValues = form.watch();

  const handlePhotoUpload = async (file: File | null, url?: string) => {
    if (file) {
      try {
        setIsUploadingPhoto(true);

        if (url) {
          setPhotoUrl(url);

          if (session?.user?.id) {
            const userResponse = await fetch(`/api/users/${session.user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                profilePicture: url,
              }),
            });

            if (!userResponse.ok) {
              console.error(
                'Erreur lors de la mise à jour de la photo de profil:',
                await userResponse.text(),
              );
              toast.error('Erreur lors de la mise à jour de la photo de profil');
              setIsUploadingPhoto(false);
              return;
            }

            const updatedUser = await userResponse.json();
            console.log('Utilisateur mis à jour:', updatedUser);

            if (session && session.user) {
              session.user.image = url;

              const event = new Event('visibilitychange');
              document.dispatchEvent(event);
            }

            toast.success('Photo de profil mise à jour avec succès');
          }
        } else {
          const imageUrl = URL.createObjectURL(file);
          setPhotoUrl(imageUrl);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la photo de profil:', error);
        toast.error('Erreur lors de la mise à jour de la photo de profil');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleCvUpload = async (file: File | null) => {
    if (file) {
      try {
        const syntheticEvent = {
          target: {
            files: [file],
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        const uploadResult = await handleUploadFile(syntheticEvent, 'studylink_images');

        if (!uploadResult.url) {
          console.error("L'upload a échoué - aucune URL retournée");
          console.error('Erreur détaillée:', uploadResult.error);
          throw new Error(uploadResult.error || "Échec de l'upload du CV");
        }

        setUploadedCv(file);
        setCvUrl(uploadResult.url);
        return uploadResult.url;
      } catch (error) {
        console.error("Erreur détaillée lors de l'upload du CV:", error);
        toast.error("Erreur lors de l'upload du CV");
        return null;
      }
    }
    return null;
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const isValidSchoolEmail = await validateSchoolEmail(data.schoolEmail);
      if (!isValidSchoolEmail) {
        toast.error("L'email scolaire n'est pas valide pour l'école sélectionnée");
        setIsSubmitting(false);
        return;
      }
      const studentData: CreateStudentData = {
        userId: session?.user?.id || '',
        schoolId: data.school,
        studentEmail: data.schoolEmail,
        status: data.status,
        skills: data.skills.join(', '),
        apprenticeshipRhythm: data.alternanceRhythm || null,
        description: data.description || '',
        previousCompanies: experiences.map((exp) => exp.company).join(', '),
        availability: data.availability || true,
      };

      if (
        !studentData.userId ||
        !studentData.schoolId ||
        !studentData.status ||
        !studentData.skills ||
        studentData.availability === undefined
      ) {
        console.error('Données manquantes:', {
          userId: !studentData.userId,
          schoolId: !studentData.schoolId,
          status: !studentData.status,
          skills: !studentData.skills,
          availability: studentData.availability === undefined,
        });
        throw new Error('Toutes les données requises ne sont pas présentes');
      }

      if (uploadedCv) {
        try {
          const cvUrl = await handleCvUpload(uploadedCv);
          if (cvUrl) {
            studentData.curriculumVitae = cvUrl;
          }
        } catch (error) {
          console.error('Erreur lors du téléchargement du CV:', error);
          toast.error('Erreur lors du téléchargement du CV');
        }
      }

      let result;

      try {
        const userResponse = await fetch(`/api/users/${session?.user?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            profilePicture: photoUrl || null,
          }),
        });

        if (!userResponse.ok) {
          throw new Error('Erreur lors de la mise à jour des informations utilisateur');
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        toast.error('Erreur lors de la mise à jour des informations utilisateur');
        setIsSubmitting(false);
        return;
      }

      if (studentId) {
        result = await updateStudent(studentId, studentData);
        toast.success('Profil mis à jour avec succès');

        try {
          const experiencesDTO: ExperienceDTO[] = experiences.map((exp) => ({
            id: exp.id,
            company: exp.company,
            position: exp.position,
            type: exp.type,
            startDate: exp.startDate ? exp.startDate.toISOString() : '',
            endDate: exp.endDate ? exp.endDate.toISOString() : '',
            description: '',
          }));

          await updateStudentExperiences(studentId, experiencesDTO);
        } catch (error) {
          console.error('Erreur lors de la mise à jour des expériences:', error);
          toast.error('Erreur lors de la mise à jour des expériences');
        }
      } else {
        result = await createStudent(studentData);
        if (result && result.id) {
          setStudentId(result.id);

          try {
            const experiencesDTO: ExperienceDTO[] = experiences.map((exp) => ({
              id: exp.id,
              company: exp.company,
              position: exp.position,
              type: exp.type,
              startDate: exp.startDate ? exp.startDate.toISOString() : '',
              endDate: exp.endDate ? exp.endDate.toISOString() : '',
              description: '',
            }));

            await updateStudentExperiences(result.id, experiencesDTO);
          } catch (error) {
            console.error('Erreur lors de la création des expériences:', error);
            toast.error('Erreur lors de la création des expériences');
          }
        }
        toast.success('Profil créé avec succès');
      }

      router.push(`/students/profile?studentId=${result.id}`);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la création du profil',
      );
    } finally {
      setIsSubmitting(false);
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
      {
        name: 'Email scolaire',
        completed: !!formValues.schoolEmail,
        required: true,
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
    <div>
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/select-profile')}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          ← Retour à la sélection de profil
        </Button>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Compléter votre profil</h1>
              <p className="text-muted-foreground mt-2">
                Ces informations seront visibles par les entreprises et vous permettront de recevoir
                des offres correspondant à votre profil.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (form.formState.isValid) {
                  onSubmit(form.getValues());
                } else {
                  form.trigger();
                }
              }}
            >
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
                        error={form.formState.errors.firstName?.message}
                        touched={!!form.formState.touchedFields.firstName}
                        isValid={
                          !!form.formState.dirtyFields.firstName && !form.formState.errors.firstName
                        }
                        helpText="Utilisez votre prénom légal tel qu'il apparaît sur vos documents officiels"
                      >
                        <Input
                          id="firstName"
                          placeholder="Votre prénom"
                          {...form.register('firstName')}
                          className={cn(
                            form.formState.errors.firstName && 'border-destructive',
                            !form.formState.errors.firstName &&
                              form.formState.touchedFields.firstName &&
                              'border-green-500',
                          )}
                        />
                      </FormField>

                      <FormField
                        label="Nom"
                        htmlFor="lastName"
                        required
                        error={form.formState.errors.lastName?.message}
                        touched={!!form.formState.touchedFields.lastName}
                        isValid={
                          !!form.formState.dirtyFields.lastName && !form.formState.errors.lastName
                        }
                        helpText="Utilisez votre nom de famille légal"
                      >
                        <Input
                          id="lastName"
                          placeholder="Votre nom"
                          {...form.register('lastName')}
                          className={cn(
                            form.formState.errors.lastName && 'border-destructive',
                            !form.formState.errors.lastName &&
                              form.formState.touchedFields.lastName &&
                              'border-green-500',
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
                      <div onClick={(e) => e.stopPropagation()}>
                        <FileUploadInput
                          id="photoUpload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          preview={photoUrl}
                          previewType="avatar"
                          firstName={formValues.firstName}
                          lastName={formValues.lastName}
                          initialFileName={photoUrl ? 'photo_profil.jpg' : ''}
                          isLoading={isUploadingPhoto}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Statut"
                      htmlFor="status"
                      required
                      className="mt-4"
                      error={form.formState.errors.status?.message}
                    >
                      <Controller
                        control={form.control}
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
                              <Label htmlFor="stagiare">Stagiaire</Label>
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
                      error={form.formState.errors.description?.message}
                      touched={!!form.formState.touchedFields.description}
                      isValid={
                        !!form.formState.dirtyFields.description &&
                        !form.formState.errors.description
                      }
                      helpText="Décrivez votre parcours, vos projets et ce que vous recherchez. Une bonne description augmente vos chances d'être contacté."
                    >
                      <Textarea
                        id="description"
                        placeholder="Décrivez votre parcours, vos projets et vos aspirations professionnelles..."
                        className={cn(
                          'min-h-[120px]',
                          form.formState.errors.description && 'border-destructive',
                          !form.formState.errors.description &&
                            form.formState.touchedFields.description &&
                            'border-green-500',
                        )}
                        {...form.register('description')}
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
                        error={form.formState.errors.school?.message}
                      >
                        <Controller
                          control={form.control}
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

                      <FormField
                        label="Email scolaire"
                        htmlFor="schoolEmail"
                        required
                        error={form.formState.errors.schoolEmail?.message}
                        helpText="Votre email scolaire doit correspondre au domaine de votre école"
                      >
                        <Input
                          id="schoolEmail"
                          placeholder="prenom.nom@ecole.fr"
                          type="email"
                          {...form.register('schoolEmail')}
                          className={cn(
                            form.formState.errors.schoolEmail && 'border-destructive',
                            !form.formState.errors.schoolEmail &&
                              form.formState.touchedFields.schoolEmail &&
                              'border-green-500',
                          )}
                        />
                      </FormField>

                      {form.watch('status') === 'Alternant' && (
                        <FormField
                          label="Rythme d'alternance"
                          htmlFor="alternanceRhythm"
                          required
                          error={form.formState.errors.alternanceRhythm?.message}
                        >
                          <Input
                            id="alternanceRhythm"
                            placeholder="Ex: 3 semaines entreprise / 1 semaine école"
                            {...form.register('alternanceRhythm')}
                            className={cn(
                              form.formState.errors.alternanceRhythm && 'border-destructive',
                              !form.formState.errors.alternanceRhythm &&
                                form.formState.touchedFields.alternanceRhythm &&
                                'border-green-500',
                            )}
                          />
                        </FormField>
                      )}

                      <FormField
                        label="CV (facultatif)"
                        htmlFor="cvUpload"
                        hint="Format accepté : PDF"
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <FileUploadInput
                            id="cvUpload"
                            accept=".pdf"
                            onChange={(file) => handleCvUpload(file)}
                            preview={cvUrl}
                            initialFileName={uploadedCv?.name || 'cv.pdf'}
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Disponibilité"
                        htmlFor="availability"
                        required
                        error={form.formState.errors.availability?.message}
                      >
                        <Controller
                          control={form.control}
                          name="availability"
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'true')}
                              defaultValue={field.value ? 'true' : 'false'}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="available" />
                                <Label htmlFor="available">Je suis disponible</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="unavailable" />
                                <Label htmlFor="unavailable">Je ne suis pas disponible</Label>
                              </div>
                            </RadioGroup>
                          )}
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

                <TabsContent value="skills" className="mt-6 space-y-6">
                  <SectionCard title="Compétences et expertises" icon={Briefcase}>
                    <FormField
                      label="Sélectionnez vos compétences"
                      htmlFor="skills"
                      required
                      error={form.formState.errors.skills?.message}
                    >
                      <Controller
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <SkillsSelector
                            availableSkills={availableSkills}
                            selectedSkills={field.value}
                            onChange={field.onChange}
                            error={form.formState.errors.skills?.message}
                          />
                        )}
                      />
                    </FormField>

                    <div className="mt-6">
                      <h3 className="mb-4 text-lg font-medium">Expériences professionnelles</h3>
                      <p className="mb-4 text-sm text-gray-500">
                        Ajoutez vos expériences professionnelles pour les mettre en valeur sur votre
                        profil.
                      </p>
                      <ExperienceForm experiences={experiences} onChange={setExperiences} />

                      <input
                        type="hidden"
                        {...form.register('previousCompanies')}
                        value={experiences.map((exp) => exp.company).join(', ')}
                      />
                    </div>
                  </SectionCard>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedTab('education')}
                      disabled={isSubmitting}
                    >
                      Précédent
                    </Button>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (form.formState.isValid) {
                          onSubmit(form.getValues());
                        } else {
                          form.trigger();
                        }
                      }}
                    >
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
                </TabsContent>
              </Tabs>
            </form>
          </div>

          <div className="md:col-span-4">
            <div className="sticky top-6 space-y-6">
              <ProfilePreview
                firstName={formValues.firstName}
                lastName={formValues.lastName}
                photoUrl={photoUrl}
                status={formValues.status as 'Alternant' | 'Stagiaire'}
                school={schools.find((s) => s.id === formValues.school)?.name || formValues.school}
                alternanceRhythm={formValues.alternanceRhythm}
                availability={formValues.availability}
              />

              <ProfileCompletion fields={getProfileCompletionFields()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
