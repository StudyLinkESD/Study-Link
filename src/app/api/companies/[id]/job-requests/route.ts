import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const companyJobs = await prisma.job.findMany({
      where: {
        companyId: id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    const jobIds = companyJobs.map((job) => job.id);

    const jobRequests = await prisma.jobRequest.findMany({
      where: {
        jobId: {
          in: jobIds,
        },
        deletedAt: null,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(jobRequests);
  } catch {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des candidatures' },
      { status: 500 },
    );
  }
}
