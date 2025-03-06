import { useState } from 'react';
import { User } from 'lucide-react';
import FileUploadInput from '@/components/app/common/FileUploadInput';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (file: File | null, url?: string) => void;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoChange,
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);

  const handleFileChange = (file: File | null, url?: string) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        onPhotoChange(file, url);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      onPhotoChange(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
        {previewUrl ? (
          <img src={previewUrl} alt="Photo de profil" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <FileUploadInput
        onFileChange={handleFileChange}
        accept="image/*"
        maxSize={5 * 1024 * 1024} // 5MB
        label="Changer la photo"
      />
    </div>
  );
}
