import { PrismaClient } from '@prisma/client';
import { CreateJobRequestDTO, UpdateJobRequestDTO } from '@/dto/job-request.dto';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>[];
}

export async function validateJobRequestData(data: CreateJobRequestDTO): Promise<ValidationResult> {
  const errors: Record<string, string>[] = [];

  if (!data.studentId) {
    errors.push({ studentId: "L'identifiant de l'étudiant est requis" });
  }

  if (!data.jobId) {
    errors.push({ jobId: "L'identifiant du job est requis" });
  }

  if (data.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) {
      errors.push({ studentId: "L'étudiant n'existe pas" });
    }
  }

  if (data.jobId) {
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });
    if (!job) {
      errors.push({ jobId: "Le job n'existe pas" });
    }
  }
  
  if (!data.status) {
    errors.push({ status: 'Le status est requis' });
  } else {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(data.status)) {
      errors.push({ status: 'Le status doit être PENDING, ACCEPTED ou REJECTED' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function validateJobRequestUpdateData(
  data: UpdateJobRequestDTO,
): Promise<ValidationResult> {
  const errors: Record<string, string>[] = [];

  if (data.status) {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(data.status)) {
      errors.push({ status: 'Le status doit être PENDING, ACCEPTED ou REJECTED' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
