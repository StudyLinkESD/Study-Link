import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

const studentProfileSchema = z.object({
  userId: z.string(),
  schoolId: z.string(),
  studentEmail: z.string().email({ message: "L'email étudiant doit être valide" }),
  status: z.enum(['Alternant', 'Stagiaire']),
  skills: z.string(),
  description: z.string(),
  previousCompanies: z.string().optional(),
  availability: z.boolean().default(true),
  apprenticeshipRhythm: z.string().nullable(),
  curriculumVitae: z.string().nullable(),
  user: z.object({
    firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
    lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé. Vous devez être connecté.' },
        { status: 401 },
      );
    }

    const body = await request.json();

    const validationResult = studentProfileSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Erreurs de validation:', validationResult.error.errors);
      return NextResponse.json(
        {
          message: 'Données invalides',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    const existingStudentEmail = await prisma.student.findUnique({
      where: {
        studentEmail: data.studentEmail,
      },
    });

    if (existingStudentEmail) {
      return NextResponse.json(
        { message: 'Cet email étudiant est déjà utilisé.' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        student: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    if (existingUser.student) {
      return NextResponse.json({ message: 'Vous avez déjà un profil étudiant.' }, { status: 400 });
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        type: 'student',
        profileCompleted: true,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: session.user.id,
        schoolId: data.schoolId,
        studentEmail: data.studentEmail,
        status: data.status,
        skills: data.skills,
        description: data.description,
        previousCompanies: data.previousCompanies || '',
        availability: data.availability,
        apprenticeshipRhythm: data.apprenticeshipRhythm,
        curriculumVitae: data.curriculumVitae,
      },
    });

    return NextResponse.json(
      {
        message: 'Profil étudiant créé avec succès',
        student: {
          id: student.id,
          userId: student.userId,
          schoolId: student.schoolId,
          studentEmail: student.studentEmail,
          status: student.status,
          skills: student.skills,
          description: student.description,
          previousCompanies: student.previousCompanies,
          availability: student.availability,
          apprenticeshipRhythm: student.apprenticeshipRhythm,
          curriculumVitae: student.curriculumVitae,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erreur lors de la création du profil étudiant:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du profil étudiant.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé. Vous devez être connecté.' },
        { status: 401 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        student: true,
      },
    });

    if (!existingUser || !existingUser.student) {
      return NextResponse.json({ message: 'Profil étudiant non trouvé.' }, { status: 404 });
    }

    const body = await request.json();

    const validationResult = studentProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Données invalides',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    if (data.studentEmail !== existingUser.student.studentEmail) {
      const existingStudentEmail = await prisma.student.findUnique({
        where: {
          studentEmail: data.studentEmail,
        },
      });

      if (existingStudentEmail && existingStudentEmail.id !== existingUser.student.id) {
        return NextResponse.json(
          { message: 'Cet email étudiant est déjà utilisé.' },
          { status: 400 },
        );
      }
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        profileCompleted: true,
      },
    });

    const updatedStudent = await prisma.student.update({
      where: {
        id: existingUser.student.id,
      },
      data: {
        schoolId: data.schoolId,
        studentEmail: data.studentEmail,
        status: data.status,
        skills: data.skills,
        description: data.description,
        previousCompanies: data.previousCompanies || '',
        availability: data.availability,
        apprenticeshipRhythm: data.apprenticeshipRhythm,
        curriculumVitae: data.curriculumVitae,
      },
    });

    return NextResponse.json(
      {
        message: 'Profil étudiant mis à jour avec succès',
        student: updatedStudent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil étudiant:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la mise à jour du profil étudiant.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé. Vous devez être connecté.' },
        { status: 401 },
      );
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: true,
        school: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: 'Profil étudiant non trouvé.' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil étudiant:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération du profil étudiant.' },
      { status: 500 },
    );
  }
}
