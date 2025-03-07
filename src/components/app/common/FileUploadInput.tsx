import { ChangeEvent, useState } from 'react';

import ImageCropper from '@/components/app/profileForm/ImageCropper';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Input } from '@/components/ui/input';

import { handleUploadFile } from '@/services/uploadFile';

type FileUploadInputProps = {
  id: string;
  onChange: (file: File | null, url?: string) => void;
  accept: string;
  preview?: string;
  previewType?: 'avatar' | 'file';
  firstName?: string;
  lastName?: string;
  hint?: string;
};

export default function FileUploadInput({
  id,
  onChange,
  accept,
  preview,
  previewType = 'file',
  firstName,
  lastName,
  hint,
}: FileUploadInputProps) {
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);

    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (previewType === 'avatar' && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setShowCropper(true);
    } else if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadProgress(true);
    setErrorMessage(null);

    try {
      const syntheticEvent = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      const { url, error } = await handleUploadFile(syntheticEvent, 'studylink_images');

      if (url) {
        setFileUrl(url);
        onChange(file, url);
      } else if (error) {
        setErrorMessage(error);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur s'est produite lors de l'upload",
      );
    } finally {
      setUploadProgress(false);
    }
  };

  const handleCropperSave = (croppedFile: File) => {
    setShowCropper(false);
    setSelectedFile(null);
    uploadFile(croppedFile);
  };

  const handleCropperCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-2">
      {showCropper && selectedFile && (
        <ImageCropper
          image={selectedFile}
          onSave={handleCropperSave}
          onCancel={handleCropperCancel}
          isCircular={previewType === 'avatar'}
        />
      )}

      {!showCropper && (
        <>
          {previewType === 'avatar' && preview && (
            <div className="flex items-center gap-4">
              <ProfileAvatar
                photoUrl={preview}
                firstName={firstName || 'A'}
                lastName={lastName || 'B'}
                size="sm"
              />
              {fileUrl && (
                <span className="text-muted-foreground text-xs">Photo uploadée avec succès</span>
              )}
            </div>
          )}

          <Input
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileSelection}
            disabled={uploadProgress}
          />

          {uploadProgress && (
            <div className="bg-muted mt-1 h-1.5 w-full rounded-full">
              <div className="bg-primary h-1.5 w-full animate-pulse rounded-full"></div>
            </div>
          )}

          {errorMessage && <p className="text-destructive mt-1 text-xs">{errorMessage}</p>}

          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </>
      )}
    </div>
  );
}
