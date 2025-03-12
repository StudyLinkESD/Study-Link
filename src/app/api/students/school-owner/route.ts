import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé. Vous devez être connecté.' },
        { status: 401 },
      );
    }

    const schoolOwner = await prisma.schoolOwner.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        school: {
          include: {
            domain: true,
          },
        },
      },
    });

    if (!schoolOwner || !schoolOwner.school) {
      return NextResponse.json(
        { message: "Non autorisé. Vous devez être un propriétaire d'école." },
        { status: 403 },
      );
    }

    const schoolDomain = schoolOwner.school.domain.domain;

    const students = await prisma.student.findMany({
      where: {
        studentEmail: {
          endsWith: `@${schoolDomain}`,
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des étudiants.' },
      { status: 500 },
    );
  }
}
