// FileUploadInput.tsx
import { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { handleUploadFile } from '@/services/uploadFile';
import ImageCropper from '@/components/app/profileForm/ImageCropper';

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
    // Reset any previous errors
    setErrorMessage(null);

    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (previewType === 'avatar' && file.type.startsWith('image/')) {
      // For profile images, show the image editor
      setSelectedFile(file);
      setShowCropper(true);
    } else if (file) {
      // For other file types, proceed directly to upload
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadProgress(true);
    setErrorMessage(null);

    try {
      // Create a synthetic event to match handleUploadFile interface
      const syntheticEvent = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      const url = await handleUploadFile(syntheticEvent);

      if (url) {
        setFileUrl(url);
        onChange(file, url);
      } else {
        // Handle the case when URL is null but no error was thrown
        setErrorMessage("L'upload a échoué. Veuillez réessayer.");
        onChange(file);
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
    // Close the editor
    setShowCropper(false);
    setSelectedFile(null);

    // Upload the cropped file
    uploadFile(croppedFile);
  };

  const handleCropperCancel = () => {
    // Close the editor without saving
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
          isCircular={previewType === 'avatar'} // Circular profile photo
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
                <span className="text-xs text-muted-foreground">Photo uploadée avec succès</span>
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
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div className="bg-primary h-1.5 rounded-full animate-pulse w-full"></div>
            </div>
          )}

          {errorMessage && <p className="text-xs text-destructive mt-1">{errorMessage}</p>}

          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </>
      )}
    </div>
  );
}
