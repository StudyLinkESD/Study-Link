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
import BackButton from '@/components/app/common/BackButton';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import StudentStatusBadge from '@/components/app/common/StudentStatusBadge';
import InfoItem from '@/components/app/common/InfoItems';
import SectionCard from '@/components/app/common/SectionCard';
import SkillsList from '@/components/app/common/SkillsList';
import ExperienceTimeline from '@/components/app/common/ExperienceTimeline';
import RecommendationsList from '@/components/app/common/RecommendationsList';
import { getStudentById } from '@/services/student.service';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    console.error('No student ID provided');
    notFound();
  }

  try {
    console.log('Fetching student with ID:', id);
    const studentData = await getStudentById(id);

    if (!studentData) {
      console.error('Student not found with ID:', id);
      return (
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Étudiant non trouvé</h1>
            <p className="text-gray-600">
              L&apos;étudiant que vous recherchez n&apos;existe pas ou a été supprimé.
            </p>
          </div>
        </div>
      );
    }

    // Convertir les compétences en tableau
    const skillsArray =
      studentData.skills?.split(',').map((s) => ({ id: s.trim(), name: s.trim() })) || [];

    const student = {
      id: studentData.id,
      firstName: studentData.user?.firstname || 'Anonyme',
      lastName: studentData.user?.lastname || 'Anonyme',
      email: studentData.user?.email || '',
      photoUrl: studentData.user?.profilePicture
        ? `/api/files/${studentData.user.profilePicture}`
        : undefined,
      status: studentData.status,
      school: studentData.school?.name || 'Non spécifié',
      alternanceRhythm: studentData.apprenticeshipRythm || 'Non spécifié',
      description: studentData.description || 'Aucune description',
      skills: skillsArray,
      previousCompanies: studentData.previousCompanies || 'Aucune expérience',
      availability: studentData.availability ? 'Disponible' : 'Non disponible',
      curriculumVitae: studentData.curriculumVitae || undefined,
      experiences: [],
      recommendations: [],
    };

    console.log('Student data formatted:', student);

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

                {/* Utilisation du composant StudentStatusBadge */}
                <StudentStatusBadge status={student.status} className="mt-2" />

                <div className="w-full mt-6 space-y-4">
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

                <Button className="w-full mt-4">Contacter</Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {student.description && (
              <SectionCard title="À propos" icon={BookOpen}>
                <p className="text-muted-foreground">{student.description}</p>
              </SectionCard>
            )}

            {student.skills.length > 0 && (
              <SectionCard title="Compétences" icon={Award}>
                <SkillsList skills={student.skills} />
              </SectionCard>
            )}

            {student.experiences.length > 0 && (
              <SectionCard title="Expérience" icon={Briefcase}>
                <ExperienceTimeline experiences={student.experiences} />
              </SectionCard>
            )}

            {student.recommendations.length > 0 && (
              <SectionCard title="Recommandations" icon={Heart}>
                <RecommendationsList recommendations={student.recommendations} />
              </SectionCard>
            )}

            {student.curriculumVitae && (
              <Button asChild className="w-full">
                <a href={student.curriculumVitae} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le CV
                </a>
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Erreur lors du chargement de l&apos;étudiant:', error);
    return (
      <main className="container mx-auto py-4 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-6">
            Une erreur est survenue lors du chargement des informations de l&apos;étudiant.
          </p>
        </div>
      </main>
    );
  }
}
