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

export async function validateUserCreation(data: CreateUserDTO): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'Email requis' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: "Format d'email invalide" });
  }

  if (!data.firstname || data.firstname.length < 2) {
    errors.push({ field: 'firstname', message: 'Prénom requis (minimum 2 caractères)' });
  }

  if (!data.lastname || data.lastname.length < 2) {
    errors.push({ field: 'lastname', message: 'Nom requis (minimum 2 caractères)' });
  }

  if (!data.type) {
    errors.push({ field: 'type', message: "Type d'utilisateur requis" });
  } else if (!['student', 'company-owner'].includes(data.type)) {
    errors.push({ field: 'type', message: "Type d'utilisateur invalide" });
  }

  if (data.type === 'student') {
    if (!data.schoolId) {
      errors.push({ field: 'schoolId', message: "ID de l'école requis pour un étudiant" });
    } else {
      const school = await prisma.school.findUnique({
        where: { id: data.schoolId },
      });
      if (!school) {
        errors.push({ field: 'schoolId', message: 'École non trouvée' });
      }
    }
  } else if (data.type === 'company-owner') {
    if (!data.companyName) {
      errors.push({ field: 'companyName', message: "Nom de l'entreprise requis" });
    }
  }

  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      errors.push({ field: 'email', message: 'Cet email est déjà utilisé' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function validateUserUpdate(
  data: UpdateUserDTO,
  userId: string,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  const userExists = await checkUserExists(userId);
  if (!userExists.exists) {
    errors.push({ field: 'id', message: 'Utilisateur non trouvé' });
    return { isValid: false, errors };
  }

  if (data.email !== undefined) {
    if (!data.email) {
      errors.push({ field: 'email', message: 'Email requis' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: "Format d'email invalide" });
    } else {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: userId },
        },
      });
      if (existingUser) {
        errors.push({ field: 'email', message: 'Cet email est déjà utilisé' });
      }
    }
  }

  if (data.firstname !== undefined) {
    if (!data.firstname || data.firstname.length < 2) {
      errors.push({ field: 'firstname', message: 'Prénom requis (minimum 2 caractères)' });
    }
  }

  if (data.lastname !== undefined) {
    if (!data.lastname || data.lastname.length < 2) {
      errors.push({ field: 'lastname', message: 'Nom requis (minimum 2 caractères)' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const validateUserData = validateUserCreation;
