import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import StatusBadge from '@/components/app/common/StatusBadge';
import { GraduationCap, Briefcase, CheckCircle2, XCircle } from 'lucide-react';

export type StudentCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  skills: { id: string; name: string }[];
  school?: string;
  apprenticeshipRythm?: string | null;
  availability?: boolean;
};

// Composant pour afficher les compétences, extrait pour plus de clarté
const SkillsList = React.memo(({ skills }: { skills: StudentCardProps['skills'] }) => {
  // Limiter l'affichage à 3 compétences maximum
  const displayedSkills = skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedSkills.map((skill) => (
        <span key={skill.id} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
          {skill.name}
        </span>
      ))}
      {hasMoreSkills && (
        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
          +{skills.length - 3}
        </span>
      )}
    </div>
  );
});

SkillsList.displayName = 'SkillsList';

function StudentCardComponent({
  id,
  firstName = 'Anonyme',
  lastName = 'Anonyme',
  photoUrl,
  status,
  skills,
  school,
  apprenticeshipRythm,
  availability,
}: StudentCardProps) {
  return (
    <Link href={`/students/${id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
        <CardContent className="p-8 h-full flex flex-col">
          <div className="flex items-start gap-6">
            <ProfileAvatar
              photoUrl={photoUrl}
              firstName={firstName}
              lastName={lastName}
              className="w-20 h-20 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {firstName} {lastName}
                </h3>
                <div className="flex flex-col items-end gap-3">
                  {availability !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      {availability ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={availability ? 'text-green-500' : 'text-red-500'}>
                        {availability ? 'Disponible' : 'Non disponible'}
                      </span>
                    </div>
                  )}
                  <StatusBadge status={status} />
                </div>
              </div>

              {/* Informations de l'école et du rythme d'alternance */}
              <div className="space-y-3 mb-4">
                {school && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <GraduationCap className="w-5 h-5" />
                    <span>{school}</span>
                  </div>
                )}
                {apprenticeshipRythm && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Briefcase className="w-5 h-5" />
                    <span>{apprenticeshipRythm}</span>
                  </div>
                )}
              </div>

              {/* Compétences */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>Compétences</span>
                </div>
                <SkillsList skills={skills} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Mémorisation du composant pour éviter les rendus inutiles
const StudentCard = React.memo(StudentCardComponent);

export default StudentCard;
