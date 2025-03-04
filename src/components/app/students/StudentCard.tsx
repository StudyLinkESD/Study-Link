import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

// Import des composants communs
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import StatusBadge from '@/components/app/common/StatusBadge';

export type StudentCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  status: 'Alternant' | 'Stagiaire';
  skills: { id: string; name: string }[];
  availability?: string;
  school?: string;
};

export default function StudentCard({
  id,
  firstName,
  lastName,
  photoUrl,
  status,
  skills,
  availability,
  school,
}: StudentCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Utilisation du composant ProfileAvatar */}
          <ProfileAvatar
            firstName={firstName}
            lastName={lastName}
            photoUrl={photoUrl}
            size="md"
            className="border-2 border-gray-200 dark:border-gray-700"
          />

          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">
              {firstName} {lastName}
            </h3>

            <div className="flex items-center gap-2 mt-1">
              {/* Utilisation du composant StatusBadge */}
              <StatusBadge status={status} />

              {availability && (
                <span className="text-xs text-muted-foreground">{availability}</span>
              )}
            </div>

            {school && <span className="text-xs text-muted-foreground mt-1">{school}</span>}
          </div>
        </div>

        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Compétences</h4>

          {/* Nous n'utilisons pas directement SkillsList car nous voulons limiter l'affichage à 5 skills */}
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 5).map((skill) => (
              <StatusBadge
                key={skill.id}
                status={skill.name}
                variant="outline"
                className="text-xs"
              />
            ))}
            {skills.length > 5 && (
              <StatusBadge status={`+${skills.length - 5}`} variant="outline" className="text-xs" />
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3">
        <Link
          href={`/students/${id}`}
          className="text-sm text-primary hover:underline flex ml-auto items-center"
        >
          Voir le profil
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
