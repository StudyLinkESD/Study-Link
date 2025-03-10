import { PrismaClient } from '@prisma/client';

import { CreateCompanyDTO, UpdateCompanyDTO } from '@/dto/company.dto';

const prisma = new PrismaClient();

export async function validateCompanyData(
  data: CreateCompanyDTO | UpdateCompanyDTO,
  isUpdate = false,
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (isUpdate && Object.keys(data).length === 0) {
    errors.push('Aucune donnée fournie pour la mise à jour');
    return { isValid: false, errors };
  }

  if (!isUpdate && !data.name) {
    errors.push("Le nom de l'entreprise est requis");
  }

  if (data.name !== undefined) {
    if (data.name.trim().length < 2) {
      errors.push("Le nom de l'entreprise doit contenir au moins 2 caractères");
    }
    if (data.name.trim().length > 100) {
      errors.push("Le nom de l'entreprise ne peut pas dépasser 100 caractères");
    }
  }

  if (data.logo !== undefined && data.logo !== null && data.logo !== '') {
    try {
      new URL(data.logo);
    } catch {
      errors.push("L'URL du logo n'est pas valide");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function checkCompanyExists(id: string): Promise<{ exists: boolean }> {
  const company = await prisma.company.findUnique({
    where: { id },
  });

  return { exists: !!company };
}
