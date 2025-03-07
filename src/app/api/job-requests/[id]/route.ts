import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateJobRequestUpdateData } from '@/utils/validation/job-request.validation';

import { JobRequestResponseDTO, UpdateJobRequestDTO } from '@/dto/job-request.dto';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<JobRequestResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const jobRequest = await prisma.jobRequest.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        student: true,
        job: true,
      },
    });

    if (!jobRequest) {
      return NextResponse.json({ error: 'Job request non trouvée' }, { status: 404 });
    }

    const formattedJobRequest: JobRequestResponseDTO = {
      id: jobRequest.id,
      studentId: jobRequest.studentId,
      jobId: jobRequest.jobId,
      status: jobRequest.status,
      createdAt: jobRequest.createdAt,
      updatedAt: jobRequest.updatedAt,
    };

    return NextResponse.json(formattedJobRequest);
  } catch (error) {
    console.error('Erreur lors de la récupération de la job request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la job request' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<JobRequestResponseDTO | { error: string; details?: Record<string, string>[] }>
> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateJobRequestDTO;

    const validationResult = await validateJobRequestUpdateData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const jobRequest = await prisma.jobRequest.update({
      where: {
        id: id,
      },
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

    return NextResponse.json(formattedJobRequest);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la job request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la job request' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    await prisma.jobRequest.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Job request supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la job request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la job request' },
      { status: 500 },
    );
  }
}
