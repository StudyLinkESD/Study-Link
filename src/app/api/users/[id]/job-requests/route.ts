import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { EnrichedJobRequestResponseDTO } from '@/dto/job-request.dto';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<EnrichedJobRequestResponseDTO[] | { error: string }>> {
  try {
    const id = (await params).id;

    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        student: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (!user.student) {
      return NextResponse.json({ error: "L'utilisateur n'est pas un étudiant" }, { status: 400 });
    }

    const jobRequests = await prisma.jobRequest.findMany({
      where: {
        studentId: user.student.id,
        deletedAt: null,
      },
      select: {
        id: true,
        studentId: true,
        jobId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            name: true,
            description: true,
            skills: true,
            createdAt: true,
            updatedAt: true,
            company: {
              select: {
                name: true,
                createdAt: true,
                updatedAt: true,
                logo: true,
              },
            },
            featuredImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(jobRequests as EnrichedJobRequestResponseDTO[]);
  } catch (error) {
    console.error('Erreur lors de la récupération des job requests:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des job requests' },
      { status: 500 },
    );
  }
}
