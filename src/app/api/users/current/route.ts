import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyOwner: {
          include: {
            company: true,
          },
        },
        student: {
          include: {
            school: true,
          },
        },
        schoolOwner: {
          include: {
            school: true,
          },
        },
        admin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const response = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
      profilePicture: user.profilePicture,
      profileCompleted: user.profileCompleted,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.companyOwner) {
      Object.assign(response, {
        company: {
          id: user.companyOwner.company.id,
          name: user.companyOwner.company.name,
          logo: user.companyOwner.company.logo,
        },
      });
    } else if (user.student) {
      Object.assign(response, {
        student: {
          id: user.student.id,
          school: user.student.school
            ? {
                id: user.student.school.id,
                name: user.student.school.name,
                logo: user.student.school.logo,
              }
            : null,
        },
      });
    } else if (user.schoolOwner) {
      Object.assign(response, {
        school: {
          id: user.schoolOwner.school.id,
          name: user.schoolOwner.school.name,
          logo: user.schoolOwner.school.logo,
        },
      });
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 },
    );
  }
}
