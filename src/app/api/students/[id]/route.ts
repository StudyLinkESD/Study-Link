import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StudentResponseDTO, UpdateStudentDTO } from '@/dto/student.dto';
import { validateStudentData } from '@/utils/validation/student.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<StudentResponseDTO | { error: string }>> {
  try {
    const { id } = params;
    console.log("Recherche de l'étudiant avec id:", id);

    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        school: true,
      },
    });

    if (!student) {
      console.log('Aucun étudiant trouvé pour id:', id);
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    console.log('Étudiant trouvé:', student);

    const formattedStudent: StudentResponseDTO = {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      primaryRecommendationId: student.primaryRecommendationId || null,
      status: student.status as 'ACTIVE' | 'INACTIVE',
      skills: student.skills,
      apprenticeshipRythm: student.apprenticeshipRythm || null,
      description: student.description,
      curriculumVitae: student.curriculumVitae
        ? { fileUrl: student.curriculumVitae, fileId: student.curriculumVitae }
        : null,
      previousCompanies: student.previousCompanies,
      availability: student.availability,
      studentEmail: student.studentEmail,
      user: {
        id: student.user.id,
        email: student.user.email,
        firstname: student.user.firstname,
        lastname: student.user.lastname,
        profilePicture: student.user.profilePicture || null,
      },
      school: student.school
        ? {
            id: student.school.id,
            name: student.school.name,
          }
        : undefined,
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
  { params }: { params: { id: string } },
): Promise<NextResponse<StudentResponseDTO | { error: string }>> {
  try {
    const { id } = params;
    const body = (await request.json()) as UpdateStudentDTO;

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { userId: id },
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

    // Convertir le format du CV pour la base de données
    const cvData = body.curriculumVitae?.fileUrl || null;

    const student = await prisma.student.update({
      where: { userId: id },
      data: {
        ...body,
        curriculumVitae: cvData,
      },
      include: {
        user: true,
        school: true,
      },
    });

    const formattedStudent: StudentResponseDTO = {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      primaryRecommendationId: student.primaryRecommendationId || null,
      status: student.status as 'ACTIVE' | 'INACTIVE',
      skills: student.skills,
      apprenticeshipRythm: student.apprenticeshipRythm || null,
      description: student.description,
      curriculumVitae: student.curriculumVitae
        ? { fileUrl: student.curriculumVitae, fileId: student.curriculumVitae }
        : null,
      previousCompanies: student.previousCompanies,
      availability: student.availability,
      studentEmail: student.studentEmail,
      user: {
        id: student.user.id,
        email: student.user.email,
        firstname: student.user.firstname,
        lastname: student.user.lastname,
        profilePicture: student.user.profilePicture || null,
      },
      school: student.school
        ? {
            id: student.school.id,
            name: student.school.name,
          }
        : undefined,
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
  { params }: { params: { id: string } },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { id } = params;

    // Vérifier d'abord si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Rechercher l'étudiant
    const existingStudent = await prisma.student.findUnique({
      where: { userId: id },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    await prisma.student.delete({
      where: { userId: id },
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
