import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Le domaine est requis' }, { status: 400 });
    }

    const schoolDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: domain.toLowerCase(),
      },
      include: {
        schools: {
          take: 1,
        },
      },
    });

    if (!schoolDomain || schoolDomain.schools.length === 0) {
      return NextResponse.json({ error: 'Domaine non reconnu' }, { status: 404 });
    }

    const school = schoolDomain.schools[0];

    return NextResponse.json({
      schoolId: school.id,
      schoolName: school.name,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du domaine' },
      { status: 500 },
    );
  }
}
