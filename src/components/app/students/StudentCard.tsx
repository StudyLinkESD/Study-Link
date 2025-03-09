'use client';

import { Briefcase, CheckCircle2, FileText, GraduationCap, Mail, XCircle } from 'lucide-react';

import Link from 'next/link';
import React from 'react';

import StudentStatusBadge from '@/components/app/common/StudentStatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Card, CardContent } from '@/components/ui/card';

export type StudentCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  status: 'Alternant' | 'Stagiaire';
  skills: { id: string; name: string }[];
  school?: string;
  apprenticeshipRhythm?: string | null;
  availability?: boolean;
  studentEmail?: string;
  curriculumVitae?: string | null;
  description?: string;
};

const SkillsList = React.memo(({ skills }: { skills: StudentCardProps['skills'] }) => {
  const displayedSkills = skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedSkills.map((skill) => (
        <span key={skill.id} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
          {skill.name}
        </span>
      ))}
      {hasMoreSkills && (
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
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
  apprenticeshipRhythm,
  availability,
  studentEmail,
  curriculumVitae,
}: StudentCardProps) {
  const safeSkills = Array.isArray(skills) ? skills : [];

  return (
    <Link href={`/students/${id}`}>
      <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="flex h-full flex-col p-8">
          <div className="flex items-start gap-6">
            <ProfileAvatar
              photoUrl={photoUrl}
              firstName={firstName}
              lastName={lastName}
              className="h-20 w-20 flex-shrink-0"
              size="md"
            />
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-medium">{`${firstName} ${lastName}`}</h3>
                <div className="flex flex-col items-end gap-3">
                  {availability !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      {availability ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={availability ? 'text-green-500' : 'text-red-500'}>
                        {availability ? 'Disponible' : 'Non disponible'}
                      </span>
                    </div>
                  )}
                  <StudentStatusBadge status={status} />
                </div>
              </div>

              {/* Informations de l'école et du rythme d'alternance */}
              <div className="mb-4 space-y-3">
                {school && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <GraduationCap className="h-5 w-5" />
                    <span>{school}</span>
                  </div>
                )}
                {apprenticeshipRhythm && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Briefcase className="h-5 w-5" />
                    <span>{apprenticeshipRhythm}</span>
                  </div>
                )}
                {studentEmail && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-5 w-5" />
                    <span className="truncate">{studentEmail}</span>
                  </div>
                )}
                {curriculumVitae && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FileText className="h-5 w-5" />
                    <span>CV disponible</span>
                  </div>
                )}
              </div>

              {/* Compétences */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>Compétences</span>
                </div>
                <SkillsList skills={safeSkills} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const StudentCard = React.memo(StudentCardComponent);

export default StudentCard;
