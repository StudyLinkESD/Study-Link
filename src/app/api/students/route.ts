import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateStudentData } from '@/utils/validation/student.validation';

import { CreateStudentDTO, StudentResponseDTO } from '@/dto/student.dto';

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

    const formattedStudents: StudentResponseDTO[] = students.map((student) => ({
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
    const data: CreateStudentDTO = await request.json();
    const validationResult = await validateStudentData(data);

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const createdStudent = await prisma.student.create({
      data: {
        userId: data.userId,
        schoolId: data.schoolId,
        studentEmail: data.studentEmail,
        status: data.status,
        skills: data.skills,
        apprenticeshipRhythm: data.apprenticeshipRhythm,
        description: data.description,
        curriculumVitae: data.curriculumVitae,
        previousCompanies: data.previousCompanies,
        availability: data.availability,
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
      id: createdStudent.id,
      userId: createdStudent.userId,
      schoolId: createdStudent.schoolId,
      studentEmail: createdStudent.studentEmail,
      primaryRecommendationId: createdStudent.primaryRecommendationId,
      status: createdStudent.status as 'Alternant' | 'Stagiaire',
      skills: createdStudent.skills,
      apprenticeshipRhythm: createdStudent.apprenticeshipRhythm,
      description: createdStudent.description,
      curriculumVitae: createdStudent.curriculumVitae,
      previousCompanies: createdStudent.previousCompanies,
      availability: createdStudent.availability,
      user: {
        id: createdStudent.user.id,
        email: createdStudent.user.email,
        firstName: createdStudent.user.firstName,
        lastName: createdStudent.user.lastName,
        profilePicture: createdStudent.user.profilePicture,
      },
      school: createdStudent.school
        ? {
            id: createdStudent.school.id,
            name: createdStudent.school.name,
          }
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
