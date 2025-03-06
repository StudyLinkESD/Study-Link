import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UserResponseDTO } from '@/dto/user.dto';
import { ValidationError } from '@/utils/validation/user.validation';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
): Promise<NextResponse<UserResponseDTO | { error: string; details?: ValidationError[] }>> {
  try {
    const { email, firstname, lastname, type, companyName } = await request.json();

    if (!email || !firstname || !lastname || !type || !companyName) {
      return NextResponse.json(
        { error: "Email, prénom, nom, type et nom de l'entreprise sont requis" },
        { status: 400 },
      );
    }

    if (type !== 'company-owner') {
      return NextResponse.json(
        { error: "Seule l'inscription en tant que propriétaire d'entreprise est autorisée" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
      data: {
        name: companyName,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstname,
        lastname,
      },
    });

    await prisma.companyOwner.create({
      data: {
        userId: user.id,
        companyId: company.id,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
