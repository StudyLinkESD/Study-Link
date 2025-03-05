import { CreateSchoolDomainDTO, UpdateSchoolDomainDTO } from '@/dto/school-domain.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export async function validateSchoolDomainData(
  data: CreateSchoolDomainDTO | UpdateSchoolDomainDTO,
  domainId?: string,
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  if ('domain' in data && data.domain !== undefined) {
    // Validation du format du domaine
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(data.domain)) {
      errors.domain = 'Le format du domaine est invalide';
    }

    // Vérification de l'unicité du domaine
    const existingDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: data.domain,
        ...(domainId ? { id: { not: domainId } } : {}),
      },
    });

    if (existingDomain) {
      errors.domain = 'Ce domaine est déjà enregistré';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
