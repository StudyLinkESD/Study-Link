import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateUserDTO, UserResponseDTO } from '@/dto/user.dto';
import { validateUserData } from '@/utils/validation/user.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<UserResponseDTO[] | { error: string }>> {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });

    return NextResponse.json(users);
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
): Promise<NextResponse<UserResponseDTO | { error: string; details?: any }>> {
  try {
    const body = (await request.json()) as CreateUserDTO;

    const validationResult = await validateUserData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        ...body,
        email: body.email.toLowerCase()
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 },
    );
  }
}
