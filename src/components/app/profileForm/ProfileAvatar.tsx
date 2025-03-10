'use client';

import React, { useEffect, useState } from 'react';

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
  firstName,
  lastName,
  size = 'md',
  className = '',
}: ProfileAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(photoUrl);

  useEffect(() => {
    setImageError(false);
    setImageUrl(photoUrl);

    if (photoUrl) {
      let cleanUrl = photoUrl;

      if (cleanUrl.startsWith('/api/files/')) {
        cleanUrl = cleanUrl.substring('/api/files/'.length);
        setImageUrl(cleanUrl);
      }

      if (cleanUrl.includes('supabase.co/storage/v1/object/public/')) {
      }

      setImageUrl(cleanUrl);

      const img = new Image();
      img.onload = () => {
        setImageError(false);
      };
      img.onerror = () => {
        console.error("Erreur de chargement de l'image:", cleanUrl);
        setImageError(true);
      };
      img.src = cleanUrl;
    }
  }, [photoUrl]);

  const handleImageError = () => {
    console.error("Erreur de chargement de l'image:", photoUrl);
    setImageError(true);
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && !imageError ? (
        <AvatarImage
          src={imageUrl}
          alt={`${firstName || ''} ${lastName || ''}`}
          onError={handleImageError}
        />
      ) : (
        <AvatarFallback className={textSizeClasses[size]}>
          {(firstName || '?').charAt(0)}
          {(lastName || '?').charAt(0)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

const ProfileAvatar = React.memo(ProfileAvatarComponent);

export default ProfileAvatar;
