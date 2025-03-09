'use client';

import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  Edit,
  Heart,
  Mail,
  School,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import ExperienceTimeline from '@/components/app/common/ExperienceTimeline';
import InfoItem from '@/components/app/common/InfoItems';
import RecommendationsList from '@/components/app/common/RecommendationsList';
import SectionCard from '@/components/app/common/SectionCard';
import SkillsList from '@/components/app/common/SkillsList';
import StudentStatusBadge from '@/components/app/common/StudentStatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { StudentResponseDTO } from '@/dto/student.dto';
import { getStudentById } from '@/services/student.service';

const cleanPhotoUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  if (url.startsWith('/api/files/')) {
    return url.substring('/api/files/'.length);
  }

  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  return url;
};

export const dynamic = 'force-dynamic';

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudentProfileContent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Chargement...</h1>
      </div>
    </div>
  );
}

function StudentProfileContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [student, setStudent] = useState<StudentResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentIdFromUrl = searchParams.get('studentId');

        const studentIdFromSession = session?.user?.studentId;

        const studentId = studentIdFromUrl || studentIdFromSession;

        if (!studentId) {
          setLoading(false);
          return;
        }

        const studentData = await getStudentById(studentId);

        if (!studentData) {
          setLoading(false);
          return;
        }
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Chargement...</h1>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Profil non trouvé</h1>
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Erreur de données</h1>
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

  const firstName = student.user?.firstName || '';
  const lastName = student.user?.lastName || '';

  const photoUrl = cleanPhotoUrl(student.user?.profilePicture);

  const studentEmail = student.studentEmail || '';

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
    <main className="container mx-auto max-w-4xl px-4 py-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <Button onClick={() => router.push(`/students/profile-info?studentId=${student.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier mon profil
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

              <h2 className="text-center text-xl font-bold">
                {firstName} {lastName}
              </h2>

              <StudentStatusBadge status={student.status} className="mt-2" />

              <div className="mt-6 w-full space-y-4">
                {student.school && <InfoItem icon={School}>{student.school.name}</InfoItem>}

                {student.apprenticeshipRhythm && (
                  <InfoItem icon={Calendar}>{student.apprenticeshipRhythm}</InfoItem>
                )}

                {student.availability !== undefined && (
                  <InfoItem icon={Clock}>
                    {student.availability ? 'Disponible' : 'Indisponible'}
                  </InfoItem>
                )}

                <InfoItem icon={Mail}>
                  <span className="break-all">{studentEmail || session?.user?.email}</span>
                </InfoItem>

                {student.curriculumVitae && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium">Curriculum Vitae</h3>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(student.curriculumVitae || '', '_blank')}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Voir mon CV
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = student.curriculumVitae || '';
                          link.setAttribute('download', `CV_${firstName}_${lastName}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                )}

                {!student.curriculumVitae && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium">Curriculum Vitae</h3>
                    <p className="text-muted-foreground text-sm">
                      Aucun CV n&apos;a été ajouté. Modifiez votre profil pour en ajouter un.
                    </p>
                  </div>
                )}
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
