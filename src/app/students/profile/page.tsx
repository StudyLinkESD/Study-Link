'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import StatusBadge from '@/components/app/common/StatusBadge';
import InfoItem from '@/components/app/common/InfoItems';
import SectionCard from '@/components/app/common/SectionCard';
import SkillsList from '@/components/app/common/SkillsList';
import ExperienceTimeline from '@/components/app/common/ExperienceTimeline';
import RecommendationsList from '@/components/app/common/RecommendationsList';
import { toast } from 'sonner';
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
      <div className="container mx-auto py-8 px-4 max-w-4xl flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profil non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n&apos;avez pas encore créé votre profil étudiant.
          </p>
          <Button onClick={() => router.push('/students/profile-info')}>
            Créer mon profil
          </Button>
        </div>
      </div>
    );
  }

  const firstName = student.user?.firstname || session?.user?.name?.split(' ')[0] || '';
  const lastName = student.user?.lastname || session?.user?.name?.split(' ')[1] || '';
  const photoUrl = student.user?.profilePicture || session?.user?.image || undefined;

  const experiences = student.previousCompanies
    .split(',')
    .filter(company => company.trim())
    .map((company, index) => ({
      id: `exp-${index}`,
      position: 'Stage/Alternance',
      company: company.trim(),
      startDate: 'Non spécifié',
      description: '',
    }));

  return (
    <main className="container mx-auto py-4 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <Button onClick={() => router.push('/students/profile-info')}>
          <Edit className="w-4 h-4 mr-2" />
          Modifier mon profil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <h2 className="text-xl font-bold text-center">
                {firstName} {lastName}
              </h2>

              <StatusBadge status={student.status} className="mt-2" />

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
                  {student.description || 'Aucune description n\'a été ajoutée.'}
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