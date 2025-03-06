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

  if ('name' in data && data.name !== undefined) {
    if (data.name.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }
  }

  if ('domainId' in data && data.domainId !== undefined) {
    const domain = await prisma.authorizedSchoolDomain.findUnique({
      where: { id: data.domainId },
    });
    if (!domain) {
      errors.domainId = 'Le domaine spécifié n\'existe pas';
    }
  }

  if ('logo' in data && data.logo !== undefined && data.logo !== null) {
    try {
      const url = new URL(data.logo);
      if (!url.href.startsWith('https://')) {
        errors.logo = 'Le logo doit être une URL HTTPS valide';
      }
    } catch {
      errors.logo = 'L\'URL du logo n\'est pas valide';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
