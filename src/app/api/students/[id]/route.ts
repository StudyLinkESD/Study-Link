import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateStudentData } from '@/utils/validation/student.validation';

import { StudentResponseDTO, UpdateStudentDTO } from '@/dto/student.dto';

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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const formattedStudent: StudentResponseDTO = {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      studentEmail: student.studentEmail,
      primaryRecommendationId: student.primaryRecommendationId,
      status: student.status as 'Alternant' | 'Stagiaire',
      skills: student.skills,
      apprenticeshipRhythm: student.apprenticeshipRhythm,
      description: student.description,
      curriculumVitae: student.curriculumVitae,
      previousCompanies: student.previousCompanies,
      availability: student.availability,
      user: {
        id: student.user.id,
        email: student.user.email,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        profilePicture: student.user.profilePicture,
      },
      school: student.school
        ? {
            id: student.school.id,
            name: student.school.name,
          }
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      include: {
        user: true,
        school: true,
      },
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

    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: {
        status: body.status || existingStudent.status,
        skills: body.skills || existingStudent.skills,
        apprenticeshipRhythm: body.apprenticeshipRhythm,
        description: body.description || existingStudent.description,
        curriculumVitae: body.curriculumVitae,
        previousCompanies: body.previousCompanies || existingStudent.previousCompanies,
        availability:
          body.availability !== undefined ? body.availability : existingStudent.availability,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedStudent: StudentResponseDTO = {
      id: updatedStudent.id,
      userId: updatedStudent.userId,
      schoolId: updatedStudent.schoolId,
      studentEmail: updatedStudent.studentEmail,
      primaryRecommendationId: updatedStudent.primaryRecommendationId,
      status: updatedStudent.status as 'Alternant' | 'Stagiaire',
      skills: updatedStudent.skills,
      apprenticeshipRhythm: updatedStudent.apprenticeshipRhythm,
      description: updatedStudent.description,
      curriculumVitae: updatedStudent.curriculumVitae,
      previousCompanies: updatedStudent.previousCompanies,
      availability: updatedStudent.availability,
      user: {
        id: updatedStudent.user.id,
        email: updatedStudent.user.email,
        firstName: updatedStudent.user.firstName,
        lastName: updatedStudent.user.lastName,
        profilePicture: updatedStudent.user.profilePicture,
      },
      school: updatedStudent.school
        ? {
            id: updatedStudent.school.id,
            name: updatedStudent.school.name,
          }
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
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
