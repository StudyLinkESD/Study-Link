import { Job, PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateJobData } from '@/utils/validation/job.validation';

import { CreateJobDTO, JobResponseDTO } from '@/dto/job.dto';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<JobResponseDTO[] | { error: string }>> {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    const formattedJobs: JobResponseDTO[] = jobs.map((job) => ({
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      featuredImage: job.featuredImage || undefined,
      description: job.description,
      skills: job.skills || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des jobs' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<JobResponseDTO | { error: string; details?: Record<string, string>[] }>> {
  try {
    const body = (await request.json()) as CreateJobDTO;

    const validationResult = await validateJobData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: body,
      include: {
        company: true,
      },
    });

    const formattedJob: JobResponseDTO = {
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      featuredImage: job.featuredImage || undefined,
      description: job.description,
      skills: (job as Job).skills || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };

    return NextResponse.json(formattedJob, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du job' }, { status: 500 });
  }
}
