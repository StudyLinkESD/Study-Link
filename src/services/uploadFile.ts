import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou clé anonyme manquante. Vérifiez votre fichier .env.local');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SUPPORTED_FILE_TYPES = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  documents: ['pdf'],
};

const MIME_TYPES: { [key: string]: string } = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  normalizedExt?: string;
}

function validateFile(file: File, allowedTypes: string[]): FileValidationResult {
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  const mimeType = file.type.toLowerCase();
  const isValidMime = allowedTypes.some((ext) => {
    if (ext === 'jpg' || ext === 'jpeg') {
      return mimeType === 'image/jpeg';
    }
    return mimeType === `image/${ext}`;
  });

  if (!fileExt || !isValidMime) {
    return {
      isValid: false,
      error: `Le type du fichier n'est pas valide. Utilisez un fichier .${allowedTypes.join(', .')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Fichier trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024} Mo`,
    };
  }

  return {
    isValid: true,
    normalizedExt: fileExt === 'jpeg' ? 'jpg' : fileExt,
  };
}

export async function handleUploadFile(
  e: React.ChangeEvent<HTMLInputElement>,
  bucket: string,
): Promise<{ url: string | null; error?: string }> {
  const file = e.target.files?.[0];
  if (!file) return { url: null, error: 'Aucun fichier sélectionné' };

  const allowedTypes =
    bucket === 'studylink_images'
      ? SUPPORTED_FILE_TYPES.images
      : [...SUPPORTED_FILE_TYPES.images, ...SUPPORTED_FILE_TYPES.documents];

  const validation = validateFile(file, allowedTypes);

  if (!validation.isValid) {
    return { url: null, error: validation.error };
  }

  try {
    const fileName = `public/${Date.now()}.${validation.normalizedExt}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: MIME_TYPES[validation.normalizedExt!] || 'application/octet-stream',
    });

    if (uploadError) {
      return {
        url: null,
        error: `Le type du fichier n'est pas valide. Utilisez un fichier .${allowedTypes.join(', .')}`,
      };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { url: publicUrlData.publicUrl, error: undefined };
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    return {
      url: null,
      error: `Le type du fichier n'est pas valide. Utilisez un fichier .${allowedTypes.join(', .')}`,
    };
  }
}
