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

  if (data.logoId !== undefined && data.logoId !== null) {
    const logo = await prisma.uploadFile.findUnique({
      where: { uuid: data.logoId },
    });
    if (!logo) {
      errors.push("Le logo spécifié n'existe pas");
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
