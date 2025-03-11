import { PrismaClient } from '@prisma/client';

import { ValidationError, ValidationErrorResponse } from '@/types/error.type';

import { CreateSchoolDTO, UpdateSchoolDTO } from '@/dto/school.dto';

const prisma = new PrismaClient();

function isCreateSchoolDTO(data: CreateSchoolDTO | UpdateSchoolDTO): data is CreateSchoolDTO {
  return 'owner' in data;
}

export async function validateSchoolData(
  data: CreateSchoolDTO | UpdateSchoolDTO,
  isUpdate = false,
): Promise<ValidationErrorResponse> {
  const errors: ValidationError[] = [];

  if (!isUpdate && isCreateSchoolDTO(data)) {
    if (!data.owner) {
      errors.push({
        field: 'owner',
        message: 'Les informations du propriétaire sont requises',
      });
    } else {
      if (!data.owner.email) {
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

      if (!data.owner.firstName) {
        errors.push({
          field: 'owner.firstName',
          message: 'Le prénom du propriétaire est requis',
        });
      }

      if (!data.owner.lastName) {
        errors.push({
          field: 'owner.lastName',
          message: 'Le nom du propriétaire est requis',
        });
      }
    }
  }

  if (!data.name) {
    errors.push({
      field: 'name',
      message: "Le nom de l'école est requis",
    });
  }

  if (!data.domainId) {
    errors.push({
      field: 'domainId',
      message: "L'ID du domaine est requis",
    });
  }

  return {
    isValid: errors.length === 0,
    error: 'Validation failed',
    details: errors,
  };
}

export async function validateSchoolUpdateData(
  data: UpdateSchoolDTO,
): Promise<ValidationErrorResponse> {
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
    error: 'Validation failed',
    details: errors,
  };
}
