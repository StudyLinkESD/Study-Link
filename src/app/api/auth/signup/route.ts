import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UserResponseDTO } from '@/dto/user.dto';
import { ValidationError } from '@/utils/validation/user.validation';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
): Promise<NextResponse<UserResponseDTO | { error: string; details?: ValidationError[] }>> {
  try {
    const { email, firstname, lastname, type, schoolId } = await request.json();

    if (!email || !firstname || !lastname || !type) {
      return NextResponse.json(
        { error: 'Email, prénom, nom et type sont requis' },
        { status: 400 },
      );
    }

    if (type !== 'student') {
      return NextResponse.json(
        { error: "Seule l'inscription en tant qu'étudiant est autorisée" },
        { status: 400 },
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: "ID de l'école requis pour l'inscription" },
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

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstname,
        lastname,
      },
    });

    await prisma.student.create({
      data: {
        userId: user.id,
        schoolId: schoolId,
        status: 'PENDING',
        skills: '',
        description: '',
        previousCompanies: '',
        availability: false,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
