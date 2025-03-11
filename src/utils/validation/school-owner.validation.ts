import { PrismaClient } from '@prisma/client';

import { ValidationError, ValidationErrorResponse } from '@/types/error.type';

import { CreateSchoolOwnerDTO, UpdateSchoolOwnerDTO } from '@/dto/school-owner.dto';

const prisma = new PrismaClient();

export async function validateSchoolOwnerData(
  data: CreateSchoolOwnerDTO | UpdateSchoolOwnerDTO,
  isUpdate = false,
): Promise<ValidationErrorResponse> {
  const errors: ValidationError[] = [];

  if (!isUpdate && !data.userId) {
    errors.push({
      field: 'userId',
      message: "L'ID de l'utilisateur est requis",
    });
  }

  if (!isUpdate && !data.schoolId) {
    errors.push({
      field: 'schoolId',
      message: "L'ID de l'école est requis",
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

  if (data.schoolId) {
    const school = await prisma.school.findUnique({
      where: { id: data.schoolId },
    });
    if (!school) {
      errors.push({
        field: 'schoolId',
        message: "L'école spécifiée n'existe pas",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    error: 'Validation failed',
    details: errors,
  };
}
