import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateSchoolOwnerDTO, SchoolOwnerResponseDTO } from '@/dto/school-owner.dto';
import { validateSchoolOwnerData } from '@/utils/validation/school-owner.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<SchoolOwnerResponseDTO[] | { error: string }>> {
  try {
    const schoolOwners = await prisma.schoolOwner.findMany({
      include: {
        user: true,
        school: true,
      },
    });

    return NextResponse.json(schoolOwners);
  } catch (error) {
    console.error("Erreur lors de la récupération des propriétaires d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des propriétaires d'école" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<SchoolOwnerResponseDTO | { error: string; details?: Record<string, string> }>
> {
  try {
    const body = (await request.json()) as CreateSchoolOwnerDTO;

    const validationResult = await validateSchoolOwnerData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const schoolOwner = await prisma.schoolOwner.create({
      data: {
        userId: body.userId,
        schoolId: body.schoolId,
      },
      include: {
        user: true,
        school: true,
      },
    });

    return NextResponse.json(schoolOwner, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du propriétaire d'école" },
      { status: 500 },
    );
  }
}
