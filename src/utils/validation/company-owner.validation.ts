import { CompanyOwner, PrismaClient } from '@prisma/client';

import { CreateCompanyOwnerDTO, UpdateCompanyOwnerDTO } from '@/dto/company-owner.dto';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

interface CompanyOwnerCheckResult {
  exists: boolean;
  companyOwner: CompanyOwner | null;
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

export const validateCompanyOwnerData = async (
  data: Partial<CreateCompanyOwnerDTO | UpdateCompanyOwnerDTO>,
  isUpdate: boolean = false,
  companyOwnerId?: string,
): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];

  if (!isUpdate || data.userId !== undefined) {
    if (!data.userId) {
      errors.push({
        field: 'userId',
        message: "L'ID de l'utilisateur est requis",
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        errors.push({
          field: 'userId',
          message: "L'utilisateur spécifié n'existe pas",
        });
      }

      if (isUpdate && companyOwnerId) {
        const existingCompanyOwner = await prisma.companyOwner.findFirst({
          where: {
            userId: data.userId,
            id: { not: companyOwnerId },
          },
        });

        if (existingCompanyOwner) {
          errors.push({
            field: 'userId',
            message: "Cet utilisateur est déjà propriétaire d'une entreprise",
          });
        }
      } else {
        const existingCompanyOwner = await prisma.companyOwner.findUnique({
          where: { userId: data.userId },
        });

        if (existingCompanyOwner) {
          errors.push({
            field: 'userId',
            message: "Cet utilisateur est déjà propriétaire d'une entreprise",
          });
        }
      }
    }
  }

  if (!isUpdate || data.companyId !== undefined) {
    if (!data.companyId) {
      errors.push({
        field: 'companyId',
        message: "L'ID de l'entreprise est requis",
      });
    } else {
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
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
