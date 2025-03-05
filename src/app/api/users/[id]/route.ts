import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UpdateUserDTO, UserResponseDTO } from '@/dto/user.dto';
import { validateUserData, checkUserExists } from '@/utils/validation/user.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<UserResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const userCheck = await checkUserExists(id);

    if (!userCheck.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (userCheck.isDeleted) {
      return NextResponse.json({ error: 'Cet utilisateur a été supprimé' }, { status: 410 });
    }

    if (!userCheck.user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userResponse: UserResponseDTO = {
      id: userCheck.user.id,
      email: userCheck.user.email,
      firstname: userCheck.user.firstname,
      lastname: userCheck.user.lastname,
      profilePictureId: userCheck.user.profilePictureId,
      createdAt: userCheck.user.createdAt,
      updatedAt: userCheck.user.updatedAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<UserResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const userCheck = await checkUserExists(id);

    if (!userCheck.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (userCheck.isDeleted) {
      return NextResponse.json(
        { error: 'Impossible de modifier un utilisateur supprimé' },
        { status: 410 },
      );
    }

    const body = (await request.json()) as UpdateUserDTO;

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée fournie pour la mise à jour' },
        { status: 400 },
      );
    }

    const validationResult = await validateUserData(body, true, id);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
        deletedAt: null,
      },
      data: {
        ...body,
        email: body.email?.toLowerCase(),
      },
    });

    const userResponse: UserResponseDTO = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      profilePictureId: updatedUser.profilePictureId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
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

    const existingUser = await prisma.user.findUnique({
      where: { id: id },
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

    // Transaction is used to cascade values
    // Used here to delete all information related to the user
    // If one transaction fail, other tx are not executed and a rollback is executed
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

      await tx.verificationToken.deleteMany({
        where: { identifier: existingUser.email },
      });

      await tx.user.update({
        where: { id: id },
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
