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

    return NextResponse.json(userCheck.user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
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

    const user = await prisma.user.update({
      where: {
        id: id,
        deletedAt: null,
      },
      data: {
        ...body,
        email: body.email?.toLowerCase(),
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
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
    const userCheck = await checkUserExists(id);

    if (!userCheck.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (userCheck.isDeleted) {
      return NextResponse.json({ error: 'Cet utilisateur est déjà supprimé' }, { status: 410 });
    }

    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 },
    );
  }
}
