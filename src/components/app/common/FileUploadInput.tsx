import { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import ProfileAvatar from '@/components/app/common/ProfileAvatar';
import { handleUploadFile } from '@/services/uploadFile';

type FileUploadFieldProps = {
  id: string;
  onChange: (file: File | null, url?: string) => void;
  accept: string;
  preview?: string;
  previewType?: 'avatar' | 'file';
  firstName?: string;
  lastName?: string;
  hint?: string;
};

export default function FileUploadField({
  id,
  onChange,
  accept,
  preview,
  previewType = 'file',
  firstName,
  lastName,
  hint,
}: FileUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      setUploadProgress(true);

      try {
        const url = await handleUploadFile(e);

        if (url) {
          setFileUrl(url);
          onChange(file, url);
        } else {
          onChange(file);
        }
      } catch (error) {
        console.error("Erreur lors de l'upload du fichier:", error);
      } finally {
        setUploadProgress(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      {previewType === 'avatar' && preview && (
        <div className="flex items-center gap-4">
          <ProfileAvatar
            photoUrl={preview}
            firstName={firstName || 'A'}
            lastName={lastName || 'B'}
            size="sm"
          />
          {fileUrl && (
            <span className="text-xs text-muted-foreground">Fichier uploadé avec succès</span>
          )}
        </div>
      )}

      {previewType === 'file' && fileUrl && (
        <div className="text-sm py-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Fichier uploadé :
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-primary hover:underline"
            >
              {fileUrl.split('/').pop()}
            </a>
          </span>
        </div>
      )}

      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploadProgress}
      />

      {uploadProgress && (
        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
          <div className="bg-primary h-1.5 rounded-full animate-pulse w-full"></div>
        </div>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
