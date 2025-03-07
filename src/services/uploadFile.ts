import { createClient } from '@supabase/supabase-js';

// Types
export interface UploadResult {
  fileUrl: string;
  fileId: string;
}

export interface FileValidationError {
  code: 'SIZE_ERROR' | 'TYPE_ERROR' | 'UPLOAD_ERROR' | 'UNKNOWN_ERROR';
  message: string;
}

// Constants
const SUPPORTED_FILE_TYPES = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const,
  documents: ['pdf'] as const,
} as const;

const MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
} as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou clé anonyme manquante. Vérifiez votre fichier .env.local');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions
const validateFileType = (file: File): boolean => {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const allSupportedTypes = [...SUPPORTED_FILE_TYPES.images, ...SUPPORTED_FILE_TYPES.documents];
  return !!fileExt && allSupportedTypes.includes(fileExt as (typeof allSupportedTypes)[number]);
};

const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const uploadFileToSupabase = async (
  file: File,
  bucket: string = 'studylink_images',
): Promise<UploadResult | FileValidationError> => {
  try {
    // Validation du type de fichier
    if (!validateFileType(file)) {
      return {
        code: 'TYPE_ERROR',
        message: `Type de fichier non supporté. Types acceptés : ${[...SUPPORTED_FILE_TYPES.images, ...SUPPORTED_FILE_TYPES.documents].join(', ')}`,
      };
    }

    // Validation de la taille
    if (!validateFileSize(file)) {
      return {
        code: 'SIZE_ERROR',
        message: `Fichier trop volumineux. Limite : ${MAX_FILE_SIZE / 1024 / 1024} Mo`,
      };
    }

    const fileExt = getFileExtension(file.name);
    const fileName = `public/${Date.now()}_${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: MIME_TYPES[fileExt as keyof typeof MIME_TYPES] || 'application/octet-stream',
    });

    if (uploadError) {
      console.error("Erreur lors de l'upload:", uploadError);
      return {
        code: 'UPLOAD_ERROR',
        message: "Erreur lors de l'upload du fichier",
      };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return {
      fileUrl: publicUrlData.publicUrl,
      fileId: fileName, // Using the fileName as the fileId since it's unique
    };
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    return {
      code: 'UNKNOWN_ERROR',
      message: "Une erreur inattendue s'est produite",
    };
  }
};

export const handleUploadFile = async (
  event: React.ChangeEvent<HTMLInputElement>,
  bucket: string = 'studylink_images',
): Promise<UploadResult | FileValidationError | null> => {
  const file = event.target.files?.[0];
  if (!file) return null;
  return await uploadFileToSupabase(file, bucket);
};

export const deleteUploadedFile = async (fileName: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from('studylink_images').remove([fileName]);

    if (error) {
      console.error('Erreur lors de la suppression du fichier de Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return false;
  }
};
