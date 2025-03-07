import { Briefcase, GraduationCap } from 'lucide-react';

import Link from 'next/link';
import React from 'react';

import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Card, CardContent } from '@/components/ui/card';

export type StudentCardProps = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string;
  status: 'Alternant' | 'Stagiaire';
  skills: { id: string; name: string }[];
  school?: string;
};

const SkillsList = React.memo(({ skills }: { skills: StudentCardProps['skills'] }) => {
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
      <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <ProfileAvatar
                firstName={firstName}
                lastName={lastName}
                photoUrl={photoUrl}
                size="md"
                className="border border-gray-200 dark:border-gray-700"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold">
                    {firstName} {lastName}
                  </h3>
                  <StatusBadge status={status} className="text-xs" />
                </div>

                {school && (
                  <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    <span className="truncate">{school}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
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

const StudentCard = React.memo(StudentCardComponent);

export default StudentCard;
