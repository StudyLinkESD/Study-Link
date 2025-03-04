import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateStudentDTO, StudentResponseDTO, UpdateStudentDTO } from '@/dto/student.dto';
import { validateStudentData } from '@/utils/validation/student.validation';

const prisma = new PrismaClient();

type ValidationErrorResponse = {
  error: string;
  details?: ValidationError[];
};

type ValidationError = {
  field: string;
  message: string;
};

export async function GET(): Promise<NextResponse<StudentResponseDTO[] | { error: string }>> {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        school: true,
        curriculumVitae: true,
      },
    });

    const formattedStudents: StudentResponseDTO[] = students.map((student) => ({
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
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<StudentResponseDTO | ValidationErrorResponse>> {
  try {
    const body = (await request.json()) as CreateStudentDTO;

    const validationResult = await validateStudentData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const student = await prisma.student.create({
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

    return NextResponse.json(formattedStudent, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étudiant" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
): Promise<NextResponse<StudentResponseDTO | ValidationErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID de l'étudiant manquant" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateStudentDTO;

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const validationResult = await validateStudentData(body, true, id);
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
      where: { id },
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
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID de l'étudiant manquant" }, { status: 400 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'étudiant" },
      { status: 500 },
    );
  }
}
