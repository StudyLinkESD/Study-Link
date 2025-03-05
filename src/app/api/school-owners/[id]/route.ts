import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SchoolOwnerResponseDTO, UpdateSchoolOwnerDTO } from '@/dto/school-owner.dto';
import { validateSchoolOwnerData } from '@/utils/validation/school-owner.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolOwnerResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const schoolOwner = await prisma.schoolOwner.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        school: true,
      },
    });

    if (!schoolOwner) {
      return NextResponse.json({ error: "Propriétaire d'école non trouvé" }, { status: 404 });
    }

    return NextResponse.json(schoolOwner);
  } catch (error) {
    console.error("Erreur lors de la récupération du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du propriétaire d'école" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<SchoolOwnerResponseDTO | { error: string; details?: Record<string, string> }>
> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateSchoolOwnerDTO;

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

    const schoolOwner = await prisma.schoolOwner.update({
      where: {
        id: id,
      },
      data: {
        ...(body.userId && { userId: body.userId }),
        ...(body.schoolId && { schoolId: body.schoolId }),
      },
      include: {
        user: true,
        school: true,
      },
    });

    return NextResponse.json(schoolOwner);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du propriétaire d'école" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    await prisma.schoolOwner.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Propriétaire d'école supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du propriétaire d'école" },
      { status: 500 },
    );
  }
}
