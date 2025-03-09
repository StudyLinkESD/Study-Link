import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'ID non fourni' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        student: {
          include: {
            school: true,
            jobRequests: {
              where: { deletedAt: null },
              include: {
                job: {
                  include: {
                    company: true,
                  },
                },
              },
            },
            recommendations: true,
          },
        },
        schoolOwner: {
          include: {
            school: {
              include: {
                domain: true,
              },
            },
          },
        },
        companyOwner: {
          include: {
            company: {
              include: {
                jobs: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
        admin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const id = (await params).id;
    if (!id) {
      return NextResponse.json({ error: 'ID non fourni' }, { status: 400 });
    }

    const data = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'ID non fourni' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        schoolOwner: true,
        companyOwner: true,
        admin: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (existingUser.student) {
        await tx.recommendation.deleteMany({
          where: {
            OR: [
              { studentId: existingUser.student.id },
              { primaryForStudent: { id: existingUser.student.id } },
            ],
          },
        });

        await tx.jobRequest.deleteMany({
          where: { studentId: existingUser.student.id },
        });

        await tx.student.delete({
          where: { id: existingUser.student.id },
        });
      }

      if (existingUser.schoolOwner) {
        await tx.schoolOwner.delete({
          where: { id: existingUser.schoolOwner.id },
        });
      }

      if (existingUser.companyOwner) {
        await tx.companyOwner.delete({
          where: { id: existingUser.companyOwner.id },
        });
      }

      if (existingUser.admin) {
        await tx.admin.delete({
          where: { id: existingUser.admin.id },
        });
      }

      if (existingUser.email) {
        await tx.verificationToken.deleteMany({
          where: { identifier: existingUser.email },
        });
      }

      await tx.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: 'Compte utilisateur et toutes les données associées supprimés avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte utilisateur' },
      { status: 500 },
    );
  }
}
