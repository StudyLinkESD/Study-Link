import { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ProfileAvatarProps = {
  photoUrl?: string;
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const ProfileAvatar: FC<ProfileAvatarProps> = ({
  photoUrl,
  firstName,
  lastName,
  size = 'md',
  className = '',
}) => {
  // Map des tailles
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  // Map des tailles de texte pour le fallback
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />
      ) : (
        <AvatarFallback className={textSizeClasses[size]}>
          {firstName.charAt(0)}
          {lastName.charAt(0)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default ProfileAvatar;
