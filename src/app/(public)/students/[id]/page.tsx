'use client';

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

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

type SimpleExperience = {
  id: string;
  company: string;
  position: string;
  period: string;
  type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
  startDate?: Date;
  endDate?: Date;
};

type Recommendation = {
  id: string;
  authorName: string;
  authorTitle?: string;
  content: string;
};

type Skill = {
  id: string;
  name: string;
};

type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  email: string;
  status: 'Alternant' | 'Stagiaire';
  school: string;
  skills: Skill[];
  alternanceRhythm: string;
  description: string;
  cvUrl?: string;
  availability: string;
  recommendations: Recommendation[];
};

export default function StudentPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [experiences, setExperiences] = useState<SimpleExperience[]>([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) {
        notFound();
        return;
      }

      try {
        const studentData = await getStudentById(id);

        if (!studentData) {
          notFound();
          return;
        }

        setStudent({
          id: studentData.id,
          firstName: studentData.user?.firstName || '',
          lastName: studentData.user?.lastName || '',
          photoUrl: studentData.user?.profilePicture || '',
          email: studentData.user?.email || '',
          status: studentData.status as 'Alternant' | 'Stagiaire',
          school: studentData.school?.name || '',
          skills: (studentData.skills || '').split(',').map((s: string) => ({
            id: s.trim(),
            name: s.trim(),
          })),
          alternanceRhythm: studentData.apprenticeshipRhythm || '',
          description: studentData.description || '',
          cvUrl: studentData.curriculumVitae || undefined,
          availability: studentData.availability ? 'Disponible' : 'Non disponible',
          recommendations: [],
        });

        try {
          if (studentData.previousCompanies) {
            const oldExperiences = studentData.previousCompanies
              .split(',')
              .map((company: string, index: number) => ({
                id: `exp-${index}`,
                company: company.trim(),
                position: 'Stage/Alternance',
                period: 'Non spécifié',
                type: 'Stage' as const,
              }))
              .filter((exp: SimpleExperience) => exp.company);

            setExperiences(oldExperiences);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des expériences:', error);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du profil étudiant:', error);
        notFound();
      }
    };

    fetchStudentData();
  }, [id]);

  if (loading || !student) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Chargement...</h1>
        </div>
      </div>
    );
  }

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
                  experiences={experiences}
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
}
