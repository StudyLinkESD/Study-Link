import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL ou clé anonyme manquante. Vérifiez votre fichier .env.local"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supported file types
const SUPPORTED_FILE_TYPES = {
  images: ["jpg", "jpeg", "png", "gif", "webp"],
  documents: ["pdf"],
};

export const uploadFileToSupabase = async (
  file: File,
  bucket: string = "studylink_images"
): Promise<string | null> => {
  try {
    // Validate file type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allSupportedTypes = [
      ...SUPPORTED_FILE_TYPES.images,
      ...SUPPORTED_FILE_TYPES.documents,
    ];

    if (!fileExt || !allSupportedTypes.includes(fileExt)) {
      console.error(
        `Types de fichiers autorisés : ${allSupportedTypes.join(", ")}`
      );
      return null;
    }

    // Detailed pre-upload logging
    console.log("Upload Attempt Details:", {
      bucket,
      fileExtension: fileExt,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
    });

    // Normalize extension to jpg if it's jpeg
    const normalizedExt = fileExt === "jpeg" ? "jpg" : fileExt;

    const fileName = `public/${Date.now()}.${normalizedExt}`;

    // Determine correct MIME type
    const mimeTypeMap: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
    };

    // Validate file size (optional, but recommended)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      console.error(
        `Fichier trop volumineux. Limite : ${MAX_FILE_SIZE / 1024 / 1024} Mo`
      );
      return null;
    }

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: mimeTypeMap[normalizedExt] || "application/octet-stream",
      });

    // Comprehensive error handling
    if (error) {
      console.error("Erreur détaillée d'upload:", {
        errorMessage: error.message,
        errorCode: error.cause,
        fullError: JSON.stringify(error, null, 2),
        supabaseContext: {
          url: supabaseUrl,
          bucket,
          fileName,
          contentType: mimeTypeMap[normalizedExt],
        },
      });

      // Additional diagnostic information
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log("Current authenticated user:", user);
      } catch (authError) {
        console.error("Error checking authentication:", authError);
      }

      return null;
    }

    // Récupération de l'URL publique du fichier
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    // Catch-all error logging
    console.error("Erreur globale lors de l'upload:", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorType: typeof error,
      errorStack: error instanceof Error ? error.stack : "No stack trace",
    });

    return null;
  }
};

export const handleUploadFile = async (
  event: React.ChangeEvent<HTMLInputElement>,
  bucket: string = "studylink_images"
): Promise<string | null> => {
  const file = event.target.files?.[0];
  if (!file) return null;
  return await uploadFileToSupabase(file, bucket);
};
