import { PrismaClient } from '@prisma/client';

import { ValidationError, ValidationErrorResponse } from '@/types/error.type';

import { CreateSchoolDomainDTO, UpdateSchoolDomainDTO } from '@/dto/school-domain.dto';

const prisma = new PrismaClient();

export async function validateSchoolDomainData(
  data: CreateSchoolDomainDTO | UpdateSchoolDomainDTO,
  isUpdate = false,
): Promise<ValidationErrorResponse> {
  const errors: ValidationError[] = [];

  if (!isUpdate && !data.domain) {
    errors.push({
      field: 'domain',
      message: 'Le domaine est requis',
    });
  } else if (data.domain) {
    const existingDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: data.domain,
      },
    });

    if (existingDomain) {
      errors.push({
        field: 'domain',
        message: 'Ce domaine existe déjà',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    error: 'Validation failed',
    details: errors,
  };
}
