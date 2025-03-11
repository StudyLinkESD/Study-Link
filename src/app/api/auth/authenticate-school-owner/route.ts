import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { signIn } from '@/auth';

/**
 * @swagger
 * /api/auth/authenticate-school-owner:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authentifie un school owner via email
 *     description: |
 *       Cette route permet d'authentifier un school owner en utilisant son adresse email.
 *       Un email de connexion est envoyé à l'adresse fournie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de connexion envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "L'email est requis" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        schoolOwner: true,
      },
    });

    if (!user || !user.schoolOwner) {
      return NextResponse.json(
        { error: 'NOT_SCHOOL_OWNER', message: "Vous n'êtes pas un administrateur d'école" },
        { status: 403 },
      );
    }

    if (user && user.type !== 'school_owner') {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { type: 'school_owner' },
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du type utilisateur:', error);
      }
    }

    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/school/students`;

    const signInResult = await signIn('email', {
      email: user.email,
      callbackUrl,
      redirect: false,
    });

    if (signInResult?.error) {
      console.error("Erreur lors de l'envoi de l'email:", signInResult.error);
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'authentification" },
      { status: 500 },
    );
  }
}
