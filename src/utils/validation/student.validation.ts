import { CreateStudentDTO } from '@/dto/student.dto';
import { PrismaClient } from '@prisma/client';
import { ValidationError, ValidationResult } from './user.validation';

const prisma = new PrismaClient();

export const validateStudentData = async (
  data: Partial<CreateStudentDTO>,
  isUpdate: boolean = false,
): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];

  if (!isUpdate) {
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
    }

    if (!data.schoolId) {
      errors.push({
        field: 'schoolId',
        message: "L'ID de l'école est requis",
      });
    } else {
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
  }

  if (!isUpdate || data.status !== undefined) {
    if (!data.status) {
      errors.push({
        field: 'status',
        message: 'Le statut est requis',
      });
    }
  }

  if (!isUpdate || data.skills !== undefined) {
    if (!data.skills) {
      errors.push({
        field: 'skills',
        message: 'Les compétences sont requises',
      });
    }
  }

  if (!isUpdate || data.description !== undefined) {
    if (!data.description) {
      errors.push({
        field: 'description',
        message: 'La description est requise',
      });
    } else if (data.description.length < 100) {
      errors.push({
        field: 'description',
        message: 'La description doit contenir au moins 100 caractères',
      });
    }
  }

  if (!isUpdate || data.previousCompanies !== undefined) {
    if (!data.previousCompanies) {
      errors.push({
        field: 'previousCompanies',
        message: 'Les expériences précédentes sont requises',
      });
    }
  }

  if (!isUpdate || data.availability !== undefined) {
    if (data.availability === undefined) {
      errors.push({
        field: 'availability',
        message: 'La disponibilité est requise',
      });
    }
  }

  if (data.curriculumVitae) {
    try {
      const url = new URL(data.curriculumVitae.fileUrl);
      if (!url.href.startsWith('https://')) {
        errors.push({
          field: 'curriculumVitae',
          message: 'Le CV doit être une URL HTTPS valide',
        });
      }
    } catch {
      errors.push({
        field: 'curriculumVitae',
        message: 'Le CV doit être une URL valide',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
