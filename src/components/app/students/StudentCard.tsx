import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import StatusBadge from '@/components/app/common/StatusBadge';
import { Briefcase, GraduationCap } from 'lucide-react';

export type StudentCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  status: 'Alternant' | 'Stagiaire';
  skills: { id: string; name: string }[];
  school?: string;
};

// Composant pour afficher les compétences, extrait pour plus de clarté
const SkillsList = React.memo(({ skills }: { skills: StudentCardProps['skills'] }) => {
  // Limiter l'affichage à 3 compétences maximum
  const displayedSkills = skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedSkills.map((skill) => (
        <StatusBadge key={skill.id} status={skill.name} variant="outline" className="text-xs" />
      ))}
      {hasMoreSkills && (
        <StatusBadge status={`+${skills.length - 3}`} variant="outline" className="text-xs" />
      )}
    </div>
  );
});

SkillsList.displayName = 'SkillsList';

function StudentCardComponent({
  id,
  firstName,
  lastName,
  photoUrl,
  status,
  skills,
  school,
}: StudentCardProps) {
  return (
    <Link href={`/students/${id}`} className="block h-full">
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-full">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* En-tête avec avatar et informations principales */}
            <div className="flex items-start gap-4">
              <ProfileAvatar
                firstName={firstName}
                lastName={lastName}
                photoUrl={photoUrl}
                size="md"
                className="border border-gray-200 dark:border-gray-700"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold truncate">
                    {firstName} {lastName}
                  </h3>
                  <StatusBadge status={status} className="text-xs" />
                </div>

                {school && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="truncate">{school}</span>
                  </div>
                )}
              </div>
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
        </CardContent>
      </Card>
    </Link>
  );
}

// Mémorisation du composant pour éviter les rendus inutiles
const StudentCard = React.memo(StudentCardComponent);

export default StudentCard;
