import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('[JOBS_GET]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, skills } = body;

    if (!name || !description) {
      return new NextResponse('Données manquantes', { status: 400 });
    }

    // Pour le moment, on crée une entreprise par défaut si elle n'existe pas
    let company = await prisma.company.findFirst();

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Entreprise par défaut',
        },
      });
    }

    const job = await prisma.job.create({
      data: {
        name,
        description,
        skills,
        companyId: company.id,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('[JOBS_POST]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}
