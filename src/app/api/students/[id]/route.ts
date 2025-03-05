import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StudentResponseDTO, UpdateStudentDTO } from '@/dto/student.dto';
import { validateStudentData } from '@/utils/validation/student.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<StudentResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        school: true,
        curriculumVitae: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const formattedStudent: StudentResponseDTO = {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      primaryRecommendationId: student.primaryRecommendationId || undefined,
      status: student.status,
      skills: student.skills,
      apprenticeshipRythm: student.apprenticeshipRythm || undefined,
      description: student.description,
      curriculumVitaeId: student.curriculumVitaeId || undefined,
      previousCompanies: student.previousCompanies,
      availability: student.availability,
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'étudiant" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<StudentResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateStudentDTO;

    const existingStudent = await prisma.student.findUnique({
      where: { id: id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const validationResult = await validateStudentData(body, true);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const student = await prisma.student.update({
      where: { id: id },
      data: body,
      include: {
        user: true,
        school: true,
        curriculumVitae: true,
      },
    });

    const formattedStudent: StudentResponseDTO = {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      primaryRecommendationId: student.primaryRecommendationId || undefined,
      status: student.status,
      skills: student.skills,
      apprenticeshipRythm: student.apprenticeshipRythm || undefined,
      description: student.description,
      curriculumVitaeId: student.curriculumVitaeId || undefined,
      previousCompanies: student.previousCompanies,
      availability: student.availability,
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'étudiant" },
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
    const existingStudent = await prisma.student.findUnique({
      where: { id: id },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    await prisma.student.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: 'Profil étudiant supprimé avec succès. Le compte utilisateur reste actif.',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du profil étudiant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du profil étudiant' },
      { status: 500 },
    );
  }
}
