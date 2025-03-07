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

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ExperienceTimeline from '@/components/app/common/ExperienceTimeline';
import InfoItem from '@/components/app/common/InfoItems';
import RecommendationsList from '@/components/app/common/RecommendationsList';
import SectionCard from '@/components/app/common/SectionCard';
import SkillsList from '@/components/app/common/SkillsList';
import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { StudentResponseDTO } from '@/dto/student.dto';

export default function StudentProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<StudentResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchStudentProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/students/students/${session.user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student profile:', error);
        toast.error('Impossible de charger votre profil');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchStudentProfile();
    }
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[400px] max-w-4xl items-center justify-center px-4 py-8">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Profil non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n&apos;avez pas encore créé votre profil étudiant.
          </p>
          <Button onClick={() => router.push('/students/profile-info')}>Créer mon profil</Button>
        </div>
      </div>
    );
  }

  const firstName = student.user?.firstName || session?.user?.name?.split(' ')[0] || '';
  const lastName = student.user?.lastName || session?.user?.name?.split(' ')[1] || '';
  const photoUrl = student.user?.profilePicture || session?.user?.image || undefined;

  const experiences = student.previousCompanies
    .split(',')
    .filter((company) => company.trim())
    .map((company, index) => ({
      id: `exp-${index}`,
      position: 'Stage/Alternance',
      company: company.trim(),
      startDate: 'Non spécifié',
      description: '',
    }));

  return (
    <main className="container mx-auto max-w-4xl px-4 py-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <Button onClick={() => router.push('/students/profile-info')}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier mon profil
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ProfileAvatar
                firstName={firstName}
                lastName={lastName}
                photoUrl={photoUrl}
                size="lg"
                className="mb-4"
              />

              <h2 className="text-center text-xl font-bold">
                {firstName} {lastName}
              </h2>

              <StatusBadge status={student.status} className="mt-2" />

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
