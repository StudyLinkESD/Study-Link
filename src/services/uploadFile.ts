import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Variables d'environnement côté serveur
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const prisma = new PrismaClient();

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

export const uploadFileToSupabase = async (
  file: File,
  bucket: string = 'studylink_images',
): Promise<{ fileUrl: string; fileId: string } | null> => {
  try {
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allSupportedTypes = [...SUPPORTED_FILE_TYPES.images, ...SUPPORTED_FILE_TYPES.documents];

    if (!fileExt || !allSupportedTypes.includes(fileExt)) {
      console.error(
        `Type de fichier non supporté. Types acceptés : ${allSupportedTypes.join(', ')}`,
      );
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error(`Fichier trop volumineux. Limite : ${MAX_FILE_SIZE / 1024 / 1024} Mo`);
      return null;
    }

    const fileName = `public/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: MIME_TYPES[fileExt] || 'application/octet-stream',
    });

    if (uploadError) {
      console.error("Erreur lors de l'upload:", uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

    // Créer une entrée dans la table UploadFile
    const uploadFile = await prisma.uploadFile.create({
      data: {
        uuid: uuidv4(),
        fileUrl: publicUrlData.publicUrl,
      },
    });

    return {
      fileUrl: publicUrlData.publicUrl,
      fileId: uploadFile.uuid,
    };
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    return null;
  }
};

export const handleUploadFile = async (
  event: React.ChangeEvent<HTMLInputElement>,
  bucket: string = 'studylink_images',
): Promise<{ fileUrl: string; fileId: string } | null> => {
  const file = event.target.files?.[0];
  if (!file) return null;
  return await uploadFileToSupabase(file, bucket);
};
