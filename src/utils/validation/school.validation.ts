import { PrismaClient } from '@prisma/client';

import { CreateSchoolDTO, UpdateSchoolDTO } from '@/dto/school.dto';

const prisma = new PrismaClient();

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

export async function validateSchoolData(data: CreateSchoolDTO): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  if (!data.name?.trim()) {
    errors.push({
      field: 'name',
      message: "Le nom de l'école est requis",
    });
  } else if (data.name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Le nom doit contenir au moins 2 caractères',
    });
  }

  if (!data.domainId?.trim()) {
    errors.push({
      field: 'domainId',
      message: "L'ID du domaine est requis",
    });
  } else {
    const domain = await prisma.authorizedSchoolDomain.findUnique({
      where: { id: data.domainId },
    });
    if (!domain) {
      errors.push({
        field: 'domainId',
        message: "Le domaine spécifié n'existe pas",
      });
    }
  }

  if (data.logo) {
    try {
      const url = new URL(data.logo);
      if (!url.href.startsWith('https://')) {
        errors.push({
          field: 'logo',
          message: 'Le logo doit être une URL HTTPS valide',
        });
      }
    } catch {
      errors.push({
        field: 'logo',
        message: "L'URL du logo n'est pas valide",
      });
    }
  }

  if (!data.owner?.email?.trim()) {
    errors.push({
      field: 'owner.email',
      message: "L'email du propriétaire est requis",
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.owner.email)) {
    errors.push({
      field: 'owner.email',
      message: "L'email du propriétaire n'est pas valide",
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function validateSchoolUpdateData(data: UpdateSchoolDTO): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  if (data.name !== undefined) {
    if (!data.name?.trim()) {
      errors.push({
        field: 'name',
        message: "Le nom de l'école est requis",
      });
    } else if (data.name.length < 2) {
      errors.push({
        field: 'name',
        message: 'Le nom doit contenir au moins 2 caractères',
      });
    }
  }

  if (data.domainId !== undefined) {
    if (!data.domainId?.trim()) {
      errors.push({
        field: 'domainId',
        message: "L'ID du domaine est requis",
      });
    } else {
      const domain = await prisma.authorizedSchoolDomain.findUnique({
        where: { id: data.domainId },
      });
      if (!domain) {
        errors.push({
          field: 'domainId',
          message: "Le domaine spécifié n'existe pas",
        });
      }
    }
  }

  if (data.logo !== undefined) {
    if (data.logo) {
      try {
        const url = new URL(data.logo);
        if (!url.href.startsWith('https://')) {
          errors.push({
            field: 'logo',
            message: 'Le logo doit être une URL HTTPS valide',
          });
        }
      } catch {
        errors.push({
          field: 'logo',
          message: "L'URL du logo n'est pas valide",
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
