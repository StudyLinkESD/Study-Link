import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  Download,
  Heart,
  Mail,
  School,
} from 'lucide-react';

import { notFound } from 'next/navigation';

import BackButton from '@/components/app/common/BackButton';
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

import { getStudentById } from '@/services/student.service';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  try {
    const studentData = await getStudentById(id);

    if (!studentData) {
      notFound();
    }

    const skillsArray = studentData.skills
      .split(',')
      .map((s) => ({ id: s.trim(), name: s.trim() }));

    let status: 'Alternant' | 'Stagiaire' = 'Stagiaire';

    const alternanceKeywords = ['alternance', 'apprentissage', 'alternant', 'apprenti'];
    if (
      skillsArray.some((skill) =>
        alternanceKeywords.some((keyword) => skill.name.toLowerCase().includes(keyword)),
      )
    ) {
      status = 'Alternant';
    }

    const student = {
      id: studentData.id,
      firstName: studentData.user?.firstName || '',
      lastName: studentData.user?.lastName || '',
      photoUrl: studentData.user?.profilePicture
        ? `/api/files/${studentData.user.profilePicture}`
        : '',
      email: studentData.user?.email || '',
      status,
      school: studentData.school?.name || '',
      skills: skillsArray,
      alternanceRhythm: studentData.apprenticeshipRythm || '',
      description: studentData.description,
      cvUrl: studentData.curriculumVitae ? `/api/files/${studentData.curriculumVitae}` : undefined,
      availability: studentData.availability ? 'Disponible' : 'Non disponible',
      recommendations: [],
      experiences: [],
    };

    return (
      <main className="container mx-auto max-w-4xl px-4 py-4">
        <BackButton href="/students" label="Retour à la liste des étudiants" className="mb-6" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <ProfileAvatar
                  firstName={student.firstName}
                  lastName={student.lastName}
                  photoUrl={student.photoUrl}
                  size="lg"
                  className="mb-4"
                />

                <h1 className="text-center text-xl font-bold">
                  {student.firstName} {student.lastName}
                </h1>

                <StatusBadge status={student.status} className="mt-2" />

                <div className="mt-6 w-full space-y-4">
                  {student.school && <InfoItem icon={School}>{student.school}</InfoItem>}

                  {student.alternanceRhythm && (
                    <InfoItem icon={Calendar}>{student.alternanceRhythm}</InfoItem>
                  )}

                  {student.availability && (
                    <InfoItem icon={Clock}>
                      {student.availability === 'Disponible' ? 'Disponible' : 'Indisponible'}
                    </InfoItem>
                  )}

                  {student.email && (
                    <InfoItem icon={Mail}>
                      <span className="break-all">{student.email}</span>
                    </InfoItem>
                  )}
                </div>

                {student.cvUrl && (
                  <a
                    href={student.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="mt-6 w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le CV
                    </Button>
                  </a>
                )}

                <Button className="mt-4 w-full">Contacter</Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="experience">Expérience</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                {student.description && (
                  <SectionCard title="À propos" icon={BookOpen}>
                    <p>{student.description}</p>
                  </SectionCard>
                )}

                <SectionCard title="Compétences" icon={Award}>
                  <SkillsList skills={student.skills} />
                </SectionCard>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <SectionCard title="Expériences professionnelles" icon={Briefcase}>
                  <ExperienceTimeline
                    experiences={student.experiences}
                    emptyMessage="Aucune expérience professionnelle listée."
                  />
                </SectionCard>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <SectionCard title="Recommandations" icon={Heart}>
                  <RecommendationsList
                    recommendations={student.recommendations}
                    emptyMessage="Aucune recommandation disponible."
                  />
                </SectionCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Erreur lors du chargement du profil étudiant:', error);
    notFound();
  }
}
