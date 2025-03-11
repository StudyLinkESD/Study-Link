import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

type FormattedJob = {
  id: string;
  offerTitle: string;
  companyName: string;
  description: string;
  logoUrl: string;
  status: string;
  skills: { id: string; name: string }[];
  availability?: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<FormattedJob[] | { error: string }>> {
  try {
    const id = (await params).id;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const jobs = await prisma.job.findMany({
      where: {
        companyId: id,
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      offerTitle: job.name,
      companyName: job.company.name,
      description: job.description,
      logoUrl: job.company.logo || '',
      status: job.type,
      skills: job.skills
        ? job.skills.split(',').map((skill) => ({
            id: skill.trim().toLowerCase(),
            name: skill.trim(),
          }))
        : [],
      availability: job.availability || undefined,
    }));

    return NextResponse.json(formattedJobs);
  } catch {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des offres' },
      { status: 500 },
    );
  }
}
