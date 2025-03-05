import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateJobRequestDTO, JobRequestResponseDTO } from '@/dto/job-request.dto';
import { validateJobRequestData } from '@/utils/validation/job-request.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<JobRequestResponseDTO[] | { error: string }>> {
  try {
    const jobRequests = await prisma.jobRequest.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        student: true,
        job: true,
      },
    });

    const formattedJobRequests: JobRequestResponseDTO[] = jobRequests.map((jobRequest) => ({
      id: jobRequest.id,
      studentId: jobRequest.studentId,
      jobId: jobRequest.jobId,
      status: jobRequest.status,
      createdAt: jobRequest.createdAt,
      updatedAt: jobRequest.updatedAt,
    }));

    return NextResponse.json(formattedJobRequests);
  } catch (error) {
    console.error('Erreur lors de la récupération des job requests:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des job requests' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<JobRequestResponseDTO | { error: string; details?: Record<string, string>[] }>
> {
  try {
    const body = (await request.json()) as CreateJobRequestDTO;

    const validationResult = await validateJobRequestData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const jobRequest = await prisma.jobRequest.create({
      data: body,
      include: {
        student: true,
        job: true,
      },
    });

    const formattedJobRequest: JobRequestResponseDTO = {
      id: jobRequest.id,
      studentId: jobRequest.studentId,
      jobId: jobRequest.jobId,
      status: jobRequest.status,
      createdAt: jobRequest.createdAt,
      updatedAt: jobRequest.updatedAt,
    };

    return NextResponse.json(formattedJobRequest, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la job request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la job request' },
      { status: 500 },
    );
  }
}
