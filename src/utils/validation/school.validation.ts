import { CreateSchoolDTO, UpdateSchoolDTO } from '@/dto/school.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export async function validateSchoolData(
  data: CreateSchoolDTO | UpdateSchoolDTO,
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  // Validation du nom
  if ('name' in data && data.name !== undefined) {
    if (data.name.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }
  }

  // Validation du domainId
  if ('domainId' in data && data.domainId !== undefined) {
    const domain = await prisma.authorizedSchoolDomain.findUnique({
      where: { id: data.domainId },
    });
    if (!domain) {
      errors.domainId = "Le domaine spécifié n'existe pas";
    }
  }

  // Validation du logoId si présent
  if ('logoId' in data && data.logoId !== undefined && data.logoId !== null) {
    const logo = await prisma.uploadFile.findUnique({
      where: { uuid: data.logoId },
    });
    if (!logo) {
      errors.logoId = "Le fichier logo spécifié n'existe pas";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
