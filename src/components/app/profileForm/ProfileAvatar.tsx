import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ProfileAvatarProps = {
  photoUrl?: string;
  firstName: string | null;
  lastName: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

const ProfileAvatarComponent = ({
  photoUrl,
  firstName: firstName,
  lastName: lastName,
  size = 'md',
  className = '',
}: ProfileAvatarProps) => {
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />
      ) : (
        <AvatarFallback className={textSizeClasses[size]}>
          {firstName?.charAt(0)}
          {lastName?.charAt(0)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

const ProfileAvatar = React.memo(ProfileAvatarComponent);

export default ProfileAvatar;
