import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Récupère les détails d'un utilisateur
 *     description: Retourne les informations détaillées d'un utilisateur avec ses relations (étudiant, école, entreprise, etc.)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDTO'
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               email: "student@school.com"
 *               firstName: "John"
 *               lastName: "Doe"
 *               type: "student"
 *               profilePicture: "https://example.com/photos/john.jpg"
 *               profileCompleted: true
 *               emailVerified: true
 *               createdAt: "2024-03-10T12:00:00Z"
 *               updatedAt: "2024-03-10T12:00:00Z"
 *               student:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 schoolId: "987fcdeb-51d3-a456-b789-426614174000"
 *                 school:
 *                   name: "École d'Ingénieurs"
 *                   domain:
 *                     name: "school-domain.com"
 *       400:
 *         description: ID non fourni
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "ID non fourni"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Une erreur est survenue lors de la récupération de l'utilisateur"
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Met à jour un utilisateur
 *     description: Met à jour les informations d'un utilisateur existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           examples:
 *             updateProfile:
 *               summary: Mise à jour du profil
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 profilePicture: "https://example.com/photos/john-updated.jpg"
 *                 profileCompleted: true
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDTO'
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               email: "john.doe@example.com"
 *               firstName: "John"
 *               lastName: "Doe"
 *               profilePicture: "https://example.com/photos/john-updated.jpg"
 *       400:
 *         description: ID non fourni
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "ID non fourni"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erreur lors de la mise à jour de l'utilisateur"
 */
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
        profilePicture: data.profilePicture,
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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Supprime un utilisateur
 *     description: |
 *       Supprime un utilisateur et toutes ses données associées :
 *       - Recommandations (pour les étudiants)
 *       - Demandes d'emploi (pour les étudiants)
 *       - Profil étudiant/propriétaire d'école/propriétaire d'entreprise
 *       - Tokens de vérification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Compte utilisateur et toutes les données associées supprimés avec succès"
 *       400:
 *         description: ID non fourni
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "ID non fourni"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erreur lors de la suppression du compte utilisateur"
 */
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
