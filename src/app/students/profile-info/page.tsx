'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, School, Briefcase, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionCard from '@/components/app/common/SectionCard';
import FormField from '@/components/app/profileForm/FormField';
import ProfilePreview from '@/components/app/profileForm/ProfilePreview';
import ProfileCompletion from '@/components/app/profileForm/ProfileCompletion';
import FileUploadInput from '@/components/app/common/FileUploadInput';
import SkillsSelector from '@/components/app/profileForm/SkillsSelector';
import NavigationButtons from '@/components/app/profileForm/NavigationButton';
import { cn } from '@/lib/utils';
import { CreateStudentData } from '@/dto/student.dto';
import { validateSchoolEmail } from '@/services/school.service';
import { uploadFileToSupabase } from '@/services/uploadFile';

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
  previousCompanies: z
    .string()
    .min(1, { message: 'Veuillez renseigner vos entreprises précédentes' }),
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

export default function StudentProfileForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadedCv, setUploadedCv] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      status: 'ACTIVE',
      school: '',
      availability: true,
      alternanceRhythm: '',
      description: '',
      skills: [],
      previousCompanies: '',
      schoolEmail: '',
    },
  });

  const getStudentByUserId = async (userId: string) => {
    try {
      console.log("Recherche de l'étudiant pour userId:", userId);
      const response = await fetch(`/api/students/user/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Aucun étudiant trouvé pour userId:', userId);
          return null;
        }
        throw new Error(`Erreur ${response.status} lors de la récupération de l'étudiant`);
      }

      const data = await response.json();
      console.log("Données de l'étudiant récupérées:", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'étudiant:", error);
      return null;
    }
  };

  const createStudent = async (data: CreateStudentData) => {
    try {
      console.log('Envoi des données au serveur:', data);
      const response = await fetch(`/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Réponse brute du serveur:', responseData);

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

  const updateStudent = async (userId: string, data: CreateStudentData) => {
    try {
      console.log('Mise à jour du profil étudiant pour userId:', userId);
      const response = await fetch(`/api/students/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
    if (!session?.user?.id) return;

    try {
      console.log("Tentative de chargement du profil pour l'utilisateur:", session.user.id);
      const studentData = await getStudentByUserId(session.user.id);
      console.log("Données brutes reçues de l'API:", studentData);
      console.log('Email scolaire reçu:', studentData?.studentEmail);

      if (studentData) {
        console.log("Données de l'étudiant à charger dans le formulaire:", {
          firstName: studentData.user?.firstname,
          lastName: studentData.user?.lastname,
          status: studentData.status,
          school: studentData.schoolId,
          availability: studentData.availability,
          alternanceRhythm: studentData.apprenticeshipRythm,
          description: studentData.description,
          skills: studentData.skills,
          previousCompanies: studentData.previousCompanies,
          schoolEmail: studentData.studentEmail,
        });

        setPhotoUrl(studentData.user?.profilePicture || '');

        // Mettre à jour les valeurs du formulaire
        const formData = {
          firstName: studentData.user?.firstname || '',
          lastName: studentData.user?.lastname || '',
          status: studentData.status || 'ACTIVE',
          school: studentData.schoolId || '',
          availability: studentData.availability ?? true,
          alternanceRhythm: studentData.apprenticeshipRythm || '',
          description: studentData.description || '',
          skills: studentData.skills
            ? studentData.skills.split(',').map((skill: string) => skill.trim())
            : [],
          previousCompanies: studentData.previousCompanies || '',
          schoolEmail: studentData.studentEmail || '',
        };

        console.log('Données formatées pour le formulaire:', formData);
        console.log('Email scolaire dans formData:', formData.schoolEmail);
        form.reset(formData);
        console.log('Valeur du champ email scolaire après reset:', form.getValues('schoolEmail'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Impossible de charger votre profil');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, form]);

  useEffect(() => {
    // Rediriger si non connecté
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchSchools();
    loadStudentProfile();
  }, [status, router, fetchSchools, loadStudentProfile]);

  const formValues = form.watch();

  const handlePhotoUpload = (file: File | null, url?: string) => {
    if (file) {
      const imageUrl = url || URL.createObjectURL(file);
      setPhotoUrl(imageUrl);
    }
  };

  const handleCvUpload = async (file: File | null) => {
    if (file) {
      try {
        console.log("Début de l'upload du CV:", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        // Upload du fichier vers Supabase
        const result = await uploadFileToSupabase(file, 'studylink_images');

        if (!result) {
          console.error("L'upload a échoué - aucune URL retournée");
          throw new Error("Échec de l'upload du CV");
        }

        if ('code' in result) {
          console.error('Erreur de validation:', result.message);
          throw new Error(result.message);
        }

        console.log('Upload réussi:', result);
        setUploadedCv(file);
        return result;
      } catch (error) {
        console.error("Erreur détaillée lors de l'upload du CV:", error);
        toast.error("Erreur lors de l'upload du CV");
        return null;
      }
    }
    return null;
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) {
      toast.error('Vous devez être connecté pour enregistrer votre profil');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting form with data:', data);

      // Validate school email domain
      const isValidSchoolEmail = await validateSchoolEmail(data.schoolEmail);
      if (!isValidSchoolEmail) {
        toast.error("L'email scolaire doit correspondre à une école enregistrée");
        setIsSubmitting(false);
        return;
      }

      // Validation des données requises
      if (!data.firstName || !data.lastName || !data.status || !data.school) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (data.status === 'ACTIVE' && !data.alternanceRhythm) {
        toast.error("Veuillez renseigner votre rythme d'alternance");
        return;
      }

      if (!data.skills || data.skills.length < 3) {
        toast.error('Veuillez sélectionner au moins 3 compétences');
        return;
      }

      // Mise à jour des informations utilisateur si nécessaire
      if (data.firstName || data.lastName) {
        try {
          const userResponse = await fetch(`/api/users/${session.user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstname: data.firstName,
              lastname: data.lastName,
            }),
          });

          if (!userResponse.ok) {
            const userError = await userResponse.json();
            console.error("Erreur lors de la mise à jour de l'utilisateur:", userError);
            throw new Error(userError.error || "Erreur lors de la mise à jour de l'utilisateur");
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
          // Continuer malgré l'erreur
        }
      }

      let cvData = null;
      if (uploadedCv) {
        try {
          const uploadResult = await handleCvUpload(uploadedCv);
          if (!uploadResult || 'error' in uploadResult || !('fileUrl' in uploadResult)) {
            throw new Error("Échec de l'upload du CV");
          }
          cvData = {
            fileUrl: uploadResult.fileUrl,
            fileId: uploadResult.fileUrl, // Utiliser l'URL comme ID pour le moment
          };
        } catch (error) {
          console.error("Erreur lors de l'upload du CV:", error);
          toast.error("Erreur lors de l'upload du CV");
          return;
        }
      }

      const studentData: CreateStudentData = {
        userId: session.user.id,
        schoolId: data.school,
        status: data.status,
        skills: data.skills.join(', '),
        apprenticeshipRythm: data.status === 'ACTIVE' ? data.alternanceRhythm || null : null,
        description: data.description || '',
        curriculumVitae: cvData,
        previousCompanies: data.previousCompanies || 'Aucune expérience',
        availability: data.availability,
        studentEmail: data.schoolEmail,
        createdAt: new Date(),
      };

      console.log('Données du formulaire:', data);
      console.log('Données préparées pour le serveur:', studentData);

      // Vérifier si un étudiant existe déjà pour cet utilisateur
      console.log("Vérification de l'existence d'un étudiant pour userId:", session.user.id);
      const existingStudent = await getStudentByUserId(session.user.id);
      console.log('Résultat de la vérification:', existingStudent);

      if (existingStudent) {
        console.log('Mise à jour du profil existant pour userId:', session.user.id);
        // Mise à jour d'un profil existant
        const response = await updateStudent(session.user.id, studentData);
        console.log('Réponse du serveur (update):', response);
        toast.success('Profil mis à jour avec succès');
      } else {
        console.log("Création d'un nouveau profil étudiant");
        // Création d'un nouveau profil
        const response = await createStudent(studentData);
        console.log('Réponse du serveur (create):', response);
        toast.success('Profil créé avec succès');
      }

      // Rediriger vers la page du profil étudiant
      router.push('/students/profile');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement du profil",
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
        required: formValues.status === 'ACTIVE',
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
      <div className="container mx-auto py-8 px-4 max-w-4xl flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Compléter votre profil</h1>
      <p className="text-muted-foreground mb-8">
        Ces informations seront visibles par les entreprises et vous permettront de recevoir des
        offres correspondant à votre profil.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                            <RadioGroupItem value="ACTIVE" id="active" />
                            <Label htmlFor="active">Actif</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="INACTIVE" id="inactive" />
                            <Label htmlFor="inactive">Inactif</Label>
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
                      !!form.formState.dirtyFields.description && !form.formState.errors.description
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

              <TabsContent value="education" className="space-y-6 mt-6">
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

                    {form.watch('status') === 'ACTIVE' && (
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
                      <FileUploadInput
                        id="cvUpload"
                        accept=".pdf"
                        onChange={(file) => handleCvUpload(file)}
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

                  <FormField
                    label="Entreprises précédentes"
                    htmlFor="previousCompanies"
                    required
                    className="mt-4"
                    error={form.formState.errors.previousCompanies?.message}
                  >
                    <Input
                      id="previousCompanies"
                      placeholder="Listez vos entreprises précédentes"
                      {...form.register('previousCompanies')}
                      className={cn(
                        form.formState.errors.previousCompanies && 'border-destructive',
                        !form.formState.errors.previousCompanies &&
                          form.formState.touchedFields.previousCompanies &&
                          'border-green-500',
                      )}
                    />
                  </FormField>
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
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log('Bouton Enregistrer cliqué');
                      console.log('État du formulaire:', formValues);
                      console.log('Erreurs:', form.formState.errors);
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
              status={formValues.status as 'ACTIVE' | 'INACTIVE'}
              school={formValues.school}
              alternanceRhythm={formValues.alternanceRhythm}
              availability={formValues.availability}
            />

            <ProfileCompletion fields={getProfileCompletionFields()} />
          </div>
        </div>
      </div>
    </div>
  );
}
