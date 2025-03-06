import { PrismaClient } from '@prisma/client';
import { CreateCompanyDTO, UpdateCompanyDTO } from '@/dto/company.dto';
import { Company } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

interface CompanyCheckResult {
  exists: boolean;
  isDeleted: boolean;
  company?: Company;
}

export async function validateCompanyData(
  data: CreateCompanyDTO | UpdateCompanyDTO,
  isUpdate = false,
): Promise<ValidationResult> {
  const errors: string[] = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Le nom de la compagnie est requis');
    } else if (data.name.length < 2) {
      errors.push('Le nom de la compagnie doit contenir au moins 2 caractères');
    }
  }

  if (data.logo !== undefined && data.logo !== null) {
    try {
      const url = new URL(data.logo);
      if (!url.href.startsWith('https://')) {
        errors.push('Le logo doit être une URL HTTPS valide');
      }
    } catch {
      errors.push('L\'URL du logo n\'est pas valide');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function checkCompanyExists(id: string): Promise<CompanyCheckResult> {
  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    return { exists: false, isDeleted: false };
  }

  return {
    exists: true,
    isDeleted: false,
    company,
  };
}
