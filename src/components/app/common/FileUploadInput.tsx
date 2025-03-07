import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { handleUploadFile } from '@/services/uploadFile';
import ImageCropper from '@/components/app/profileForm/ImageCropper';
import { Button } from '@/components/ui/button';
import { Upload, File as FileIcon } from 'lucide-react';

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

      setTimeout(() => {
        onChange(file, result.url || undefined);
      }, 0);
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <FileIcon size={16} />
              <span className="truncate max-w-[200px]">{fileName || 'Fichier téléchargé'}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileSelection}
              disabled={uploadProgress}
              className="hidden"
            />
            <div className="flex-1 border rounded-md px-3 py-2 text-sm text-muted-foreground truncate">
              {fileName || 'Aucun fichier choisi'}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={uploadProgress}
              onSubmit={(e) => e.preventDefault()}
            >
              <Upload size={16} className="mr-2" />
              Parcourir
            </Button>
          </div>

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
