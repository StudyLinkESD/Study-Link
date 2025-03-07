import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SchoolResponseDTO } from '@/dto/school.dto';
import { validateSchoolData } from '@/utils/validation/school.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
): Promise<NextResponse<SchoolResponseDTO[] | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where = {
      deletedAt: null,
      ...(isActive !== null ? { isActive: isActive === 'true' } : {}),
    };

    const schools = await prisma.school.findMany({
      where,
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

interface CreateSchoolDTO {
  name: string;
  domainId: string;
  logo?: string | null;
  owner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export async function POST(
  request: Request,
): Promise<NextResponse<{ id: string } | { error: string; details?: Record<string, string> }>> {
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

    const existingDomain = await prisma.authorizedSchoolDomain.findUnique({
      where: { id: body.domainId },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: "Le domaine spécifié n'existe pas" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.owner.email,
          firstName: body.owner.firstName,
          lastName: body.owner.lastName,
        },
      });

      const school = await tx.school.create({
        data: {
          name: body.name,
          logo: body.logo,
          domainId: body.domainId,
        },
      });

      await tx.schoolOwner.create({
        data: {
          userId: user.id,
          schoolId: school.id,
        },
      });

      return school;
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Erreur lors de la création de l'école:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'école" }, { status: 500 });
  }
}
