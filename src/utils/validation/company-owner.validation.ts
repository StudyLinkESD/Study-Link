import { CompanyOwner, PrismaClient } from '@prisma/client';

import { ValidationError, ValidationErrorResponse } from '@/types/error.type';

import { CreateCompanyOwnerDTO, UpdateCompanyOwnerDTO } from '@/dto/company-owner.dto';

const prisma = new PrismaClient();

interface CompanyOwnerCheckResult {
  exists: boolean;
  companyOwner: CompanyOwner | null;
}

export async function validateCompanyOwnerData(
  data: CreateCompanyOwnerDTO | UpdateCompanyOwnerDTO,
  isUpdate = false,
): Promise<ValidationErrorResponse> {
  const errors: ValidationError[] = [];

  if (!isUpdate && !data.userId) {
    errors.push({
      field: 'userId',
      message: "L'ID de l'utilisateur est requis",
    });
  }

  if (!isUpdate && !data.companyId) {
    errors.push({
      field: 'companyId',
      message: "L'ID de l'entreprise est requis",
    });
  }

  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      errors.push({
        field: 'userId',
        message: "L'utilisateur spécifié n'existe pas",
      });
    }
  }

  if (data.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });
    if (!company) {
      errors.push({
        field: 'companyId',
        message: "L'entreprise spécifiée n'existe pas",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    error: 'Validation failed',
    details: errors,
  };
}

export const checkCompanyOwnerExists = async (id: string): Promise<CompanyOwnerCheckResult> => {
  const companyOwner = await prisma.companyOwner.findUnique({
    where: {
      id: id,
    },
  });

  return {
    exists: !!companyOwner,
    companyOwner,
  };
};
