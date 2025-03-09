import { File as FileIcon, Loader2, Upload } from 'lucide-react';

import { ChangeEvent, useEffect, useRef, useState } from 'react';

import ImageCropper from '@/components/app/profileForm/ImageCropper';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
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
  initialFileName?: string;
  isLoading?: boolean;
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
  initialFileName,
  isLoading = false,
}: FileUploadInputProps) {
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>(initialFileName || '');
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preview && !fileName) {
      try {
        const url = new URL(preview);
        const pathParts = url.pathname.split('/');
        const fileNameWithParams = pathParts[pathParts.length - 1];
        const extractedFileName = fileNameWithParams.split('?')[0];
        if (extractedFileName) {
          setFileName(extractedFileName.replace('public/', ''));
        }
      } catch (error) {
        console.error("Erreur lors de l'extraction du nom de fichier:", error);
      }
    }
  }, [preview, fileName]);

  const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setErrorMessage(null);

    const file = e.target.files?.[0] || null;

    if (!file) return;

    setFileName(file.name);

    if (previewType === 'avatar' && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setShowCropper(true);
    } else if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (isLoading) return;

    setUploadProgress(true);
    setErrorMessage(null);

    try {
      const syntheticEvent = {
        target: {
          files: [file],
        },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      const result = await handleUploadFile(syntheticEvent, 'studylink_images');

      if (!result.url) {
        setErrorMessage(result.error || "Erreur lors de l'upload du fichier");
        return;
      }

      console.log('URL obtenue après upload:', result.url);

      onChange(file, result.url);
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

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
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
            </div>
          )}

          {previewType === 'file' && preview && (
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
              <FileIcon size={16} />
              <span className="max-w-[200px] truncate">{fileName || 'Fichier téléchargé'}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileSelection}
              disabled={uploadProgress || isLoading}
              className="hidden"
            />
            <div className="text-muted-foreground flex-1 truncate rounded-md border px-3 py-2 text-sm">
              {fileName || 'Aucun fichier choisi'}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={uploadProgress || isLoading}
              onSubmit={(e) => e.preventDefault()}
            >
              {isLoading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Upload size={16} className="mr-2" />
              )}
              {isLoading ? 'Chargement...' : 'Parcourir'}
            </Button>
          </div>

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
