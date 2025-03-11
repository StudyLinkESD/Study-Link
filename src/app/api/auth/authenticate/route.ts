import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { UserType } from '@/types/user.type';

import { signIn } from '@/auth';

/**
 * @swagger
 * /api/auth/authenticate:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authentifie un utilisateur via email
 *     description: |
 *       Cette route permet d'authentifier un utilisateur en utilisant son adresse email.
 *       Si l'utilisateur n'existe pas, un nouveau compte est créé.
 *       Un email de connexion est envoyé à l'adresse fournie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthenticateRequest'
 *           examples:
 *             student:
 *               summary: Exemple d'authentification d'un étudiant
 *               value:
 *                 email: "student@school-domain.com"
 *             company:
 *               summary: Exemple d'authentification d'une entreprise
 *               value:
 *                 email: "recruiter@company.com"
 *     responses:
 *       200:
 *         description: Email de connexion envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthenticateResponse'
 *             examples:
 *               newUser:
 *                 summary: Nouvel utilisateur créé
 *                 value:
 *                   message: "Un email de connexion a été envoyé"
 *                   isNewUser: true
 *               existingUser:
 *                 summary: Utilisateur existant
 *                 value:
 *                   message: "Un email de connexion a été envoyé"
 *                   isNewUser: false
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "L'email est requis"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Une erreur est survenue lors de l'authentification"
 */
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
      callbackUrl: '/select-profile',
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
