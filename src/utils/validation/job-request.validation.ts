import { PrismaClient } from '@prisma/client';

import { ValidationError, ValidationErrorResponse } from '@/types/error.type';

import { CreateJobRequestDTO, UpdateJobRequestDTO } from '@/dto/job-request.dto';

const prisma = new PrismaClient();

export async function validateJobRequestData(
  data: CreateJobRequestDTO,
): Promise<ValidationErrorResponse> {
  const errors: ValidationError[] = [];

  if (!data.studentId) {
    errors.push({
      field: 'studentId',
      message: "L'identifiant de l'étudiant est requis",
    });
  }

  if (!data.jobId) {
    errors.push({
      field: 'jobId',
      message: "L'identifiant du job est requis",
    });
  }

  if (data.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) {
      errors.push({
        field: 'studentId',
        message: "L'étudiant n'existe pas",
      });
    }
  }

  if (data.jobId) {
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });
    if (!job) {
      errors.push({
        field: 'jobId',
        message: "Le job n'existe pas",
      });
    }
  }

  if (!data.status) {
    errors.push({
      field: 'status',
      message: 'Le status est requis',
    });
  } else {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(data.status)) {
      errors.push({
        field: 'status',
        message: 'Le status doit être PENDING, ACCEPTED ou REJECTED',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    error: 'Validation failed',
    details: errors,
  };
}

export async function validateJobRequestUpdateData(
  data: UpdateJobRequestDTO,
): Promise<ValidationErrorResponse> {
  const errors: ValidationError[] = [];

  if (data.status) {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(data.status)) {
      errors.push({
        field: 'status',
        message: 'Le status doit être PENDING, ACCEPTED ou REJECTED',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    error: 'Validation failed',
    details: errors,
  };
}
