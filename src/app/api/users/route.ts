import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateUserCreation, ValidationError } from '@/utils/validation/user.validation';

import { UserType } from '@/types/user.type';

import {
  CreateCompanyOwnerUserDTO,
  CreateSchoolOwnerUserDTO,
  CreateStudentUserDTO,
  CreateUserDTO,
  UserResponseDTO,
} from '@/dto/user.dto';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<UserResponseDTO[] | { error: string }>> {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        type: true,
        profilePicture: true,
        profileCompleted: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const typedUsers = users.map((user) => ({
      ...user,
      type: user.type as UserType,
    }));

    return NextResponse.json(typedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<UserResponseDTO | { error: string; details?: ValidationError[] }>> {
  try {
    const body = (await request.json()) as CreateUserDTO;

    const validationResult = await validateUserCreation(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const userData = {
      email: body.email.toLowerCase(),
      firstName: body.firstName,
      lastName: body.lastName,
      type: body.type,
      profilePicture: body.profilePicture,
      profileCompleted: body.profileCompleted ?? false,
    };

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        type: true,
        profilePicture: true,
        profileCompleted: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    switch (body.type) {
      case UserType.COMPANY_OWNER:
        const companyOwnerData = body as CreateCompanyOwnerUserDTO;
        await prisma.companyOwner.create({
          data: {
            userId: user.id,
            companyId: companyOwnerData.companyId,
          },
        });
        break;

      case UserType.STUDENT:
        const studentData = body as CreateStudentUserDTO;
        await prisma.student.create({
          data: {
            userId: user.id,
            schoolId: studentData.schoolId,
            studentEmail: studentData.studentEmail,
            status: studentData.status,
            skills: studentData.skills,
            apprenticeshipRhythm: studentData.apprenticeshipRhythm,
            description: studentData.description,
            curriculumVitae: studentData.curriculumVitae,
            previousCompanies: studentData.previousCompanies,
            availability: studentData.availability,
          },
        });
        break;

      case UserType.SCHOOL_OWNER:
        const schoolOwnerData = body as CreateSchoolOwnerUserDTO;
        await prisma.schoolOwner.create({
          data: {
            userId: user.id,
            schoolId: schoolOwnerData.schoolId,
          },
        });
        break;

      case UserType.ADMIN:
        await prisma.admin.create({
          data: {
            userId: user.id,
          },
        });
        break;
    }

    return NextResponse.json({
      ...user,
      type: user.type as UserType,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 },
    );
  }
}
