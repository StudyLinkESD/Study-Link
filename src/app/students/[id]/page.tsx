import { notFound } from 'next/navigation';
import {
  BookOpen,
  Briefcase,
  Heart,
  Award,
  Download,
  School,
  Calendar,
  Clock,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BackButton from '@/components/app/common/BackButton';
import ProfileAvatar from '@/components/app/common/ProfileAvatar';
import StatusBadge from '@/components/app/common/StatusBadge';
import InfoItem from '@/components/app/common/InfoItems';
import SectionCard from '@/components/app/common/SectionCard';
import SkillsList from '@/components/app/common/SkillsList';
import ExperienceTimeline from '@/components/app/common/ExperienceTimeline';
import RecommendationsList from '@/components/app/common/RecommendationsList';

const getStudentById = (id: string) => {
  const students = [
    {
      id: '1',
      firstName: 'Thomas',
      lastName: 'Dubois',
      photoUrl: '',
      email: 'thomas.dubois@ecole-dev.fr',
      status: 'Alternant' as const,
      school: 'École Supérieure de Développement Web',
      skills: [
        { id: 'react', name: 'React' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'typescript', name: 'TypeScript' },
        { id: 'nodejs', name: 'Node.js' },
        { id: 'nextjs', name: 'Next.js' },
        { id: 'tailwind', name: 'TailwindCSS' },
      ],
      alternanceRhythm: '3 semaines entreprise / 1 semaine école',
      description:
        "Passionné de développement web, je suis particulièrement intéressé par les technologies JavaScript modernes. J'ai réalisé plusieurs projets personnels et cherche une alternance pour approfondir mes connaissances.",
      cvUrl: '/cv/thomas-dubois-cv.pdf',
      availability: 'Septembre 2025',
      recommendations: [
        {
          id: 'rec1',
          authorName: 'Marie Lefevre',
          authorTitle: 'Responsable RH chez WebAgency',
          content:
            "Thomas a réalisé un stage de 2 mois dans notre entreprise. Très motivé et compétent, il s'est parfaitement intégré à l'équipe.",
        },
      ],
      experiences: [
        {
          id: 'exp1',
          company: 'WebAgency',
          position: 'Développeur Front-end (Stage)',
          startDate: 'Mai 2024',
          endDate: 'Juillet 2024',
          description:
            "Développement d'interfaces utilisateur avec React et mise en place d'une application d'administration.",
        },
      ],
    },
  ];

  return students.find((student) => student.id === id);
};

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);

  if (!student) {
    notFound();
  }

  return (
    <main className="container mx-auto py-4 px-4 max-w-4xl">
      {/* Utilisation du composant BackButton */}
      <BackButton href="/students" label="Retour à la liste des étudiants" className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {/* Utilisation du composant ProfileAvatar */}
              <ProfileAvatar
                firstName={student.firstName}
                lastName={student.lastName}
                photoUrl={student.photoUrl}
                size="lg"
                className="mb-4"
              />

              <h1 className="text-xl font-bold text-center">
                {student.firstName} {student.lastName}
              </h1>

              {/* Utilisation du composant StatusBadge */}
              <StatusBadge status={student.status} className="mt-2" />

              <div className="w-full mt-6 space-y-4">
                {/* Utilisation du composant InfoItem */}
                {student.school && <InfoItem icon={School}>{student.school}</InfoItem>}

                {student.alternanceRhythm && (
                  <InfoItem icon={Calendar}>{student.alternanceRhythm}</InfoItem>
                )}

                {student.availability && (
                  <InfoItem icon={Clock}>Disponible à partir de {student.availability}</InfoItem>
                )}

                {student.email && (
                  <InfoItem icon={Mail}>
                    <span className="break-all">{student.email}</span>
                  </InfoItem>
                )}
              </div>

              {student.cvUrl && (
                <Button className="w-full mt-6">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le CV
                </Button>
              )}

              <Button className="w-full mt-3" variant="outline">
                Contacter
              </Button>
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
              {/* Utilisation du composant SectionCard */}
              {student.description && (
                <SectionCard title="À propos" icon={BookOpen}>
                  <p>{student.description}</p>
                </SectionCard>
              )}

              <SectionCard title="Compétences" icon={Award}>
                {/* Utilisation du composant SkillsList */}
                <SkillsList skills={student.skills} />
              </SectionCard>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <SectionCard title="Expériences professionnelles" icon={Briefcase}>
                {/* Utilisation du composant ExperienceTimeline */}
                <ExperienceTimeline
                  experiences={student.experiences}
                  emptyMessage="Aucune expérience professionnelle listée."
                />
              </SectionCard>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <SectionCard title="Recommandations" icon={Heart}>
                {/* Utilisation du composant RecommendationsList */}
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
