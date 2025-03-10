import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { UserType } from '@/types/user.type';

import { signIn } from '@/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "L'email est requis" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        student: true,
        companyOwner: true,
      },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName: null,
          lastName: null,
          type: UserType.STUDENT,
          profileCompleted: false,
        },
      });
    }

    const signInResult = await signIn('resend', {
      email: normalizedEmail,
      redirect: false,
      callbackUrl: '/students/profile-info',
    });

    if (signInResult?.error) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Un email de connexion a été envoyé',
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'authentification" },
      { status: 500 },
    );
  }
}
