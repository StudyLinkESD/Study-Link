import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateSchoolDTO, SchoolResponseDTO } from '@/dto/school.dto';
import { validateSchoolData } from '@/utils/validation/school.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<SchoolResponseDTO[] | { error: string }>> {
  try {
    const schools = await prisma.school.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        domain: true,
      },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error('Erreur lors de la récupération des écoles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des écoles' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<SchoolResponseDTO | { error: string; details?: Record<string, string> }>> {
  try {
    const body = (await request.json()) as CreateSchoolDTO;

    const validationResult = await validateSchoolData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const school = await prisma.school.create({
      data: {
        name: body.name,
        domainId: body.domainId,
        logo: body.logo,
      },
      include: {
        domain: true,
      },
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'école:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'école' }, { status: 500 });
  }
}
