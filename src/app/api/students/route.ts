import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateStudentData, StudentResponseDTO } from '@/dto/student.dto';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        school: true,
      },
    });

    const formattedStudents: StudentResponseDTO[] = students.map((student) => ({
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
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: {
        id: student.user.id,
        email: student.user.email,
        firstname: student.user.firstname,
        lastname: student.user.lastname,
        profilePicture: student.user.profilePicture,
      },
      school: student.school
        ? {
            id: student.school.id,
            name: student.school.name,
          }
        : null,
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

export async function POST(request: Request) {
  try {
    const body: CreateStudentData = await request.json();

    // Vérifier si un étudiant existe déjà pour cet utilisateur
    const existingStudent = await prisma.student.findUnique({
      where: {
        userId: body.userId,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Un profil étudiant existe déjà pour cet utilisateur' },
        { status: 400 },
      );
    }

    // Récupérer l'email de l'utilisateur
    const user = await prisma.user.findUnique({
      where: {
        id: body.userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    console.log("Tentative de création de l'étudiant dans la base de données...");
    try {
      const student = await prisma.student.create({
        data: {
          userId: body.userId,
          schoolId: body.schoolId,
          studentEmail: body.studentEmail,
          status: body.status,
          skills: body.skills,
          apprenticeshipRythm: body.apprenticeshipRythm,
          description: body.description,
          curriculumVitae: body.curriculumVitae?.fileUrl || null,
          previousCompanies: body.previousCompanies,
          availability: body.availability,
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
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        user: {
          id: student.user.id,
          email: student.user.email,
          firstname: student.user.firstname,
          lastname: student.user.lastname,
          profilePicture: student.user.profilePicture,
        },
        school: student.school
          ? {
              id: student.school.id,
              name: student.school.name,
            }
          : null,
      };

      return NextResponse.json(formattedStudent, { status: 201 });
    } catch (dbError) {
      console.error('Erreur de base de données:', dbError);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'étudiant dans la base de données" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erreur détaillée lors de la création de l'étudiant:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de l'étudiant",
        details: error instanceof Error ? [{ message: error.message }] : undefined,
      },
      { status: 500 },
    );
  }
}
