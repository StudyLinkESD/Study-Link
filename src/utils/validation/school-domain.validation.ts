import { PrismaClient } from '@prisma/client';

import { CreateSchoolDomainDTO, UpdateSchoolDomainDTO } from '@/dto/school-domain.dto';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
  errorCode?: string;
}

export async function validateSchoolDomainData(
  data: CreateSchoolDomainDTO | UpdateSchoolDomainDTO,
  domainId?: string,
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  let errorCode: string | undefined;

  if ('domain' in data && data.domain !== undefined) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(data.domain)) {
      errors.domain = 'Le format du domaine est invalide';
      errorCode = 'INVALID_FORMAT';
    }

    const existingDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: data.domain,
        ...(domainId ? { id: { not: domainId } } : {}),
      },
    });

    if (existingDomain) {
      errors.domain = 'Ce domaine est déjà utilisé par une autre école';
      errorCode = 'DOMAIN_EXISTS';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    errorCode,
  };
}
