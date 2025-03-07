import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { checkJobExists, validateJobData } from '@/utils/validation/job.validation';

import { JobResponseDTO, UpdateJobDTO } from '@/dto/job.dto';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<JobResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const jobCheck = await checkJobExists(id);

    if (!jobCheck.exists) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    if (jobCheck.isDeleted) {
      return NextResponse.json({ error: 'Ce job a été supprimé' }, { status: 410 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    const jobResponse: JobResponseDTO = {
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      featuredImage: job.featuredImage || undefined,
      description: job.description,
      skills: job.skills || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };

    return NextResponse.json(jobResponse);
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du job' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<JobResponseDTO | { error: string; details?: Record<string, string>[] }>> {
  try {
    const id = (await params).id;
    const jobCheck = await checkJobExists(id);

    if (!jobCheck.exists) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    if (jobCheck.isDeleted) {
      return NextResponse.json({ error: 'Ce job a été supprimé' }, { status: 410 });
    }

    const body = (await request.json()) as UpdateJobDTO;

    const validationResult = await validateJobData(body, true);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: body,
      include: {
        company: true,
      },
    });

    const jobResponse: JobResponseDTO = {
      id: updatedJob.id,
      companyId: updatedJob.companyId,
      name: updatedJob.name,
      featuredImage: updatedJob.featuredImage || undefined,
      description: updatedJob.description,
      skills: updatedJob.skills || undefined,
      createdAt: updatedJob.createdAt,
      updatedAt: updatedJob.updatedAt,
    };

    return NextResponse.json(jobResponse);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du job' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    const jobCheck = await checkJobExists(id);

    if (!jobCheck.exists) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    if (jobCheck.isDeleted) {
      return NextResponse.json({ error: 'Ce job a déjà été supprimé' }, { status: 410 });
    }

    await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Job supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du job' }, { status: 500 });
  }
}
