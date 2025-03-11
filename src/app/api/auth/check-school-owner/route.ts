import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/auth/check-school-owner:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Vérifie si un utilisateur est un school owner
 *     description: |
 *       Cette route permet de vérifier si un utilisateur est un school owner.
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
 *         description: Vérification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSchoolOwner:
 *                   type: boolean
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

    const isSchoolOwner = !!(user && user.schoolOwner);

    return NextResponse.json({ isSchoolOwner });
  } catch (error) {
    console.error("Erreur lors de la vérification du type d'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification du type d'utilisateur" },
      { status: 500 },
    );
  }
}
