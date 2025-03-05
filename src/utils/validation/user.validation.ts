import { CreateUserDTO } from '@/dto/user.dto';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

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

export const validateUserData = async (
  data: Partial<CreateUserDTO>,
  isUpdate: boolean = false,
  userId?: string,
): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];

  if (!isUpdate || data.email !== undefined) {
    if (!data.email) {
      errors.push({
        field: 'email',
        message: "L'email est requis",
      });
    } else if (!data.email.includes('@')) {
      errors.push({
        field: 'email',
        message: "L'adresse email n'est pas valide",
      });
    } else {
      const normalizedEmail = data.email.toLowerCase();
      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          ...(isUpdate && userId ? { id: { not: userId } } : {}),
        },
      });

      if (existingUser) {
        errors.push({
          field: 'email',
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }
    }
  }

  if (!isUpdate || data.firstname !== undefined) {
    if (!data.firstname) {
      errors.push({
        field: 'firstname',
        message: 'Le prénom est requis',
      });
    } else if (data.firstname.length < 2) {
      errors.push({
        field: 'firstname',
        message: 'Le prénom doit contenir au moins 2 caractères',
      });
    }
  }

  if (!isUpdate || data.lastname !== undefined) {
    if (!data.lastname) {
      errors.push({
        field: 'lastname',
        message: 'Le nom est requis',
      });
    } else if (data.lastname.length < 2) {
      errors.push({
        field: 'lastname',
        message: 'Le nom doit contenir au moins 2 caractères',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
