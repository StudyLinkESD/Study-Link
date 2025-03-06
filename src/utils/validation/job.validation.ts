import { PrismaClient } from '@prisma/client';
import { CreateJobDTO, UpdateJobDTO } from '@/dto/job.dto';

const prisma = new PrismaClient();

export type ValidationError = Record<string, string>;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface JobExistsResult {
  exists: boolean;
  isDeleted?: boolean;
  job?: {
    id: string;
    companyId: string;
    name: string;
    featuredImage: string | null;
    description: string;
    skills: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
}

export async function validateJobData(
  data: CreateJobDTO | UpdateJobDTO,
  isUpdate = false,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  if (!isUpdate && 'companyId' in data && !data.companyId) {
    errors.push({ companyId: 'L\'ID de la compagnie est requis' });
  }

  if (!isUpdate && !data.name) {
    errors.push({ name: 'Le nom du poste est requis' });
  }

  if (!isUpdate && !data.description) {
    errors.push({ description: 'La description du poste est requise' });
  }

  if ('companyId' in data && data.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });
    if (!company) {
      errors.push({ companyId: 'La compagnie spécifiée n\'existe pas' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function checkJobExists(id: string): Promise<JobExistsResult> {
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    return { exists: false };
  }

  return {
    exists: true,
    isDeleted: job.deletedAt !== null,
    job,
  };
}
