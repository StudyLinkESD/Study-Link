import { Calendar, Clock, School } from 'lucide-react';

import InfoItem from '@/components/app/common/InfoItems';
import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProfilePreviewProps = {
  firstName: string | null;
  lastName: string | null;
  photoUrl?: string;
  status?: 'Alternant' | 'Stagiaire';
  school?: string;
  alternanceRhythm?: string;
  availability?: string;
};

export default function ProfilePreview({
  firstName,
  lastName,
  photoUrl,
  status,
  school,
  alternanceRhythm,
  availability,
}: ProfilePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Prévisualisation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col items-center">
          <ProfileAvatar
            photoUrl={photoUrl}
            firstName={firstName || 'Votre'}
            lastName={lastName || 'Nom'}
            size="md"
            className="mb-2"
          />
          <h3 className="text-center font-semibold">
            {firstName || 'Prénom'} {lastName || 'Nom'}
          </h3>
          {status && <StatusBadge status={status} className="mt-1" />}
        </div>

        <div className="space-y-2 text-sm">
          {school && (
            <InfoItem icon={School} iconSize="sm">
              {school}
            </InfoItem>
          )}
          {status === 'Alternant' && alternanceRhythm && (
            <InfoItem icon={Calendar} iconSize="sm">
              {alternanceRhythm}
            </InfoItem>
          )}
          {availability && (
            <InfoItem icon={Clock} iconSize="sm">
              Disponible dès {availability}
            </InfoItem>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
