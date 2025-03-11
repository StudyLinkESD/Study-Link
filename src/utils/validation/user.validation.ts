import { PrismaClient, User } from '@prisma/client';

import { UserType } from '@/types/user.type';

import { CreateUserDTO, UpdateUserDTO } from '@/dto/user.dto';

const prisma = new PrismaClient();

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface UserCheckResult {
  exists: boolean;
  isDeleted: boolean;
  user: User | null;
}

export const checkUserExists = async (userId: string): Promise<UserCheckResult> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return {
      exists: false,
      isDeleted: false,
      user: null,
    };
  }

  return {
    exists: true,
    isDeleted: user.deletedAt !== null,
    user,
  };
};

export async function validateUser(
  data: CreateUserDTO | UpdateUserDTO,
  options?: { userId?: string; isUpdate?: boolean },
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const isUpdate = options?.isUpdate ?? false;
  const userId = options?.userId;

  if (isUpdate && userId) {
    const userExists = await checkUserExists(userId);
    if (!userExists.exists) {
      errors.push({ field: 'id', message: 'Utilisateur non trouvé' });
      return { isValid: false, errors };
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email) {
      errors.push({ field: 'email', message: 'Email requis' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: "Format d'email invalide" });
    } else {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          ...(isUpdate && userId ? { id: { not: userId } } : {}),
        },
      });
      if (existingUser) {
        errors.push({ field: 'email', message: 'Cet email est déjà utilisé' });
      }
    }
  }

  if (!isUpdate || data.firstName !== undefined) {
    if (!data.firstName || data.firstName.length < 2) {
      errors.push({ field: 'firstName', message: 'Prénom requis (minimum 2 caractères)' });
    }
  }

  if (!isUpdate || data.lastName !== undefined) {
    if (!data.lastName || data.lastName.length < 2) {
      errors.push({ field: 'lastName', message: 'Nom requis (minimum 2 caractères)' });
    }
  }

  if (!isUpdate) {
    const createData = data as CreateUserDTO;
    if (!createData.type) {
      errors.push({ field: 'type', message: "Type d'utilisateur requis" });
    }

    switch (createData.type) {
      case UserType.STUDENT:
        if (!createData.schoolId) {
          errors.push({ field: 'schoolId', message: "ID de l'école requis pour un étudiant" });
        } else {
          const school = await prisma.school.findUnique({
            where: { id: createData.schoolId },
          });
          if (!school) {
            errors.push({ field: 'schoolId', message: 'École non trouvée' });
          }
        }
        if (!createData.studentEmail) {
          errors.push({ field: 'studentEmail', message: 'Email étudiant requis' });
        }
        if (!createData.status) {
          errors.push({ field: 'status', message: 'Statut requis' });
        }
        if (!createData.skills) {
          errors.push({ field: 'skills', message: 'Compétences requises' });
        }
        if (!createData.description) {
          errors.push({ field: 'description', message: 'Description requise' });
        }
        if (!createData.previousCompanies) {
          errors.push({ field: 'previousCompanies', message: 'Entreprises précédentes requises' });
        }
        break;

      case UserType.COMPANY_OWNER:
        if (!createData.companyId) {
          errors.push({ field: 'companyId', message: "ID de l'entreprise requis" });
        } else {
          const company = await prisma.company.findUnique({
            where: { id: createData.companyId },
          });
          if (!company) {
            errors.push({ field: 'companyId', message: 'Entreprise non trouvée' });
          }
        }
        break;

      case UserType.SCHOOL_OWNER:
        if (!createData.schoolId) {
          errors.push({ field: 'schoolId', message: "ID de l'école requis" });
        } else {
          const school = await prisma.school.findUnique({
            where: { id: createData.schoolId },
          });
          if (!school) {
            errors.push({ field: 'schoolId', message: 'École non trouvée' });
          }
        }
        break;

      case UserType.ADMIN:
        break;

      default:
        errors.push({ field: 'type', message: "Type d'utilisateur invalide" });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const validateUserCreation = (data: CreateUserDTO): Promise<ValidationResult> => {
  return validateUser(data);
};

export const validateUserUpdate = (
  data: UpdateUserDTO,
  userId: string,
): Promise<ValidationResult> => {
  return validateUser(data, { userId, isUpdate: true });
};

export const validateUserData = validateUserCreation;
