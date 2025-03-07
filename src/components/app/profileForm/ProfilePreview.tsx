import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import StudentStatusBadge from '@/components/app/common/StudentStatusBadge';
import InfoItem from '@/components/app/common/InfoItems';
import { School, Calendar, Clock } from 'lucide-react';

type ProfilePreviewProps = {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  school?: string;
  alternanceRhythm?: string;
  availability?: boolean;
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
        <div className="flex flex-col items-center mb-4">
          <ProfileAvatar
            photoUrl={photoUrl}
            firstName={firstName || 'Votre'}
            lastName={lastName || 'Nom'}
            size="md"
            className="mb-2"
          />
          <h3 className="font-semibold text-center">
            {firstName || 'Prénom'} {lastName || 'Nom'}
          </h3>
          {status && <StudentStatusBadge status={status} className="mt-1" />}
        </div>

        <div className="w-full mt-6 space-y-4">
          {school && <InfoItem icon={School}>{school}</InfoItem>}

          {status === 'ACTIVE' && alternanceRhythm && (
            <InfoItem icon={Calendar}>{alternanceRhythm}</InfoItem>
          )}

          {availability !== undefined && (
            <InfoItem icon={Clock}>{availability ? 'Disponible' : 'Indisponible'}</InfoItem>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
