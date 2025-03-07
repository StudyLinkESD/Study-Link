import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { jobId: string } }) {
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

    const job = await prisma.job.update({
      where: {
        id: params.jobId,
      },
      data: {
        name,
        description,
        skills,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('[JOB_PUT]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { jobId: string } }) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const job = await prisma.job.update({
      where: {
        id: params.jobId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('[JOB_DELETE]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}
