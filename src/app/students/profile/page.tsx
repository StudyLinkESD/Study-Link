'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Briefcase,
  Heart,
  Award,
  School,
  Calendar,
  Clock,
  Mail,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import StudentStatusBadge from '@/components/app/common/StudentStatusBadge';
import InfoItem from '@/components/app/common/InfoItems';
import SectionCard from '@/components/app/common/SectionCard';
import SkillsList from '@/components/app/common/SkillsList';
import ExperienceTimeline from '@/components/app/common/ExperienceTimeline';
import RecommendationsList from '@/components/app/common/RecommendationsList';
import { toast } from 'sonner';
import { StudentResponseDTO } from '@/dto/student.dto';
import { getStudentById } from '@/services/student.service';

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [student, setStudent] = useState<StudentResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // Vérifier si l'ID de l'étudiant est disponible dans l'URL
        const studentIdFromUrl = searchParams.get('studentId');

        // Vérifier si l'ID de l'étudiant est disponible dans la session
        const studentIdFromSession = session?.user?.studentId;

        // Utiliser l'ID de l'étudiant de l'URL ou de la session
        const studentId = studentIdFromUrl || studentIdFromSession;

        if (!studentId) {
          console.log('No student ID available, redirecting to profile creation');
          setLoading(false);
          return;
        }

        console.log('Fetching student with ID:', studentId);
        const studentData = await getStudentById(studentId);

        if (!studentData) {
          console.log('Student not found, redirecting to profile creation');
          setLoading(false);
          return;
        }

        console.log('Student data received:', studentData);
        console.log('Student email:', studentData.studentEmail);
        console.log('User data:', studentData.user);
        setStudent(studentData);
      } catch (error) {
        console.error('Error fetching student:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [searchParams, session?.user?.studentId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
          <p className="text-gray-600">
            Votre profil étudiant n&apos;existe pas encore ou n&apos;a pas pu être chargé. Veuillez
            le créer en complétant le formulaire.
          </p>
          <Button onClick={() => router.push('/students/profile-info')} className="mt-4">
            Créer mon profil
          </Button>
        </div>
      </div>
    );
  }

  if (!student.user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de données</h1>
          <p className="text-gray-600">
            Les informations de l&apos;utilisateur sont manquantes. Veuillez mettre à jour votre
            profil.
          </p>
          <Button
            onClick={() => router.push(`/students/profile-info?studentId=${student.id}`)}
            className="mt-4"
          >
            Mettre à jour mon profil
          </Button>
        </div>
      </div>
    );
  }

  const firstName = student.user?.firstname || '';
  const lastName = student.user?.lastname || '';
  const photoUrl = student.user?.profilePicture
    ? `/api/files/${student.user.profilePicture}`
    : session?.user?.image || undefined;

  const experiences = student.previousCompanies
    .split(',')
    .map((company) => company.trim())
    .filter(Boolean)
    .map((company) => ({
      id: company,
      position: 'Stage/Alternance',
      company: company,
      startDate: 'Non spécifié',
      endDate: 'Non spécifié',
      description: '',
    }));

  return (
    <main className="container mx-auto py-4 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <Button onClick={() => router.push(`/students/profile-info?studentId=${student.id}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Modifier mon profil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ProfileAvatar
                firstName={firstName || 'A'}
                lastName={lastName || 'N'}
                photoUrl={photoUrl}
                size="lg"
                className="mb-4"
              />

              <h2 className="text-xl font-bold text-center">
                {firstName} {lastName}
              </h2>

              <StudentStatusBadge status={student.status} className="mt-2" />

              <div className="w-full mt-6 space-y-4">
                {student.school && <InfoItem icon={School}>{student.school.name}</InfoItem>}

                {student.apprenticeshipRythm && (
                  <InfoItem icon={Calendar}>{student.apprenticeshipRythm}</InfoItem>
                )}

                {student.availability !== undefined && (
                  <InfoItem icon={Clock}>
                    {student.availability ? 'Disponible' : 'Indisponible'}
                  </InfoItem>
                )}

                <InfoItem icon={Mail}>
                  <span className="break-all">{session?.user?.email}</span>
                </InfoItem>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="w-full">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="skills">Compétences</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <SectionCard title="Description" icon={BookOpen}>
                <p className="text-muted-foreground">
                  {student.description || "Aucune description n'a été ajoutée."}
                </p>
              </SectionCard>

              <SectionCard title="Expérience" icon={Briefcase}>
                <ExperienceTimeline experiences={experiences} />
              </SectionCard>
            </TabsContent>

            <TabsContent value="skills">
              <SectionCard title="Compétences" icon={Award}>
                <SkillsList
                  skills={student.skills.split(',').map((skill) => ({
                    id: skill.trim(),
                    name: skill.trim(),
                  }))}
                />
              </SectionCard>
            </TabsContent>

            <TabsContent value="recommendations">
              <SectionCard title="Recommandations" icon={Heart}>
                <RecommendationsList recommendations={[]} />
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
