import { CreateUserDTO, UpdateUserDTO } from '@/dto/user.dto';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type UserCheckResult = {
  exists: boolean;
  isDeleted: boolean;
  user: User | null;
};

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
    } else if (!['student', 'company-owner'].includes(createData.type)) {
      errors.push({ field: 'type', message: "Type d'utilisateur invalide" });
    }

    if (createData.type === 'student') {
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
    } else if (createData.type === 'company-owner') {
      if (!createData.companyName) {
        errors.push({ field: 'companyName', message: "Nom de l'entreprise requis" });
      }
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
