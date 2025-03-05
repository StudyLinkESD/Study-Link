import { CreateSchoolOwnerDTO, UpdateSchoolOwnerDTO } from '@/dto/school-owner.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export async function validateSchoolOwnerData(
  data: CreateSchoolOwnerDTO | UpdateSchoolOwnerDTO,
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  if ('userId' in data && data.userId !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      errors.userId = 'L\'utilisateur spécifié n\'existe pas';
    }
  }

  if ('schoolId' in data && data.schoolId !== undefined) {
    const school = await prisma.school.findUnique({
      where: { id: data.schoolId },
    });
    if (!school) {
      errors.schoolId = 'L\'école spécifiée n\'existe pas';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
