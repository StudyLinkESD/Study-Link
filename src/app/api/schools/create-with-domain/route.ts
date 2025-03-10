import { Prisma } from '@prisma/client';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/schools/create-with-domain:
 *   post:
 *     tags:
 *       - Schools
 *     summary: Crée une école avec son domaine et son propriétaire
 *     description: |
 *       Crée une nouvelle école avec son domaine autorisé et son propriétaire en une seule opération.
 *       Cette opération est atomique (transaction) et crée :
 *       - Un domaine autorisé pour l'école
 *       - L'école associée à ce domaine
 *       - Un compte utilisateur pour le propriétaire
 *       - Les rôles admin et propriétaire d'école pour l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolWithDomainRequest'
 *     responses:
 *       200:
 *         description: École créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSchoolWithDomainResponse'
 *       400:
 *         description: Erreur de validation ou conflit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSchoolWithDomainError'
 *             examples:
 *               userExists:
 *                 value:
 *                   error: 'USER_EXISTS'
 *                   message: 'Un utilisateur avec cet email existe déjà'
 *               domainExists:
 *                 value:
 *                   error: 'DOMAIN_EXISTS'
 *                   message: 'Ce domaine est déjà utilisé'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSchoolWithDomainError'
 *             example:
 *               error: 'CREATION_FAILED'
 *               message: "Une erreur est survenue lors de la création de l'école"
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email: body.owner.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'USER_EXISTS', message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingDomain = await tx.authorizedSchoolDomain.findFirst({
        where: { domain: body.domain.toLowerCase() },
      });

      if (existingDomain) {
        throw new Error('DOMAIN_EXISTS');
      }

      const domain = await tx.authorizedSchoolDomain.create({
        data: {
          domain: body.domain.toLowerCase(),
        },
      });

      const school = await tx.school.create({
        data: {
          name: body.school.name,
          logo: body.school.logo || null,
          domainId: domain.id,
        },
      });

      const user = await tx.user.create({
        data: {
          firstName: body.owner.firstName,
          lastName: body.owner.lastName,
          email: body.owner.email.toLowerCase(),
          type: 'school_owner',
        },
      });

      await tx.admin.create({
        data: {
          userId: user.id,
        },
      });

      await tx.schoolOwner.create({
        data: {
          userId: user.id,
          schoolId: school.id,
        },
      });

      return { school, domain };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur détaillée lors de la création:', error);

    if (error instanceof Error && error.message === 'DOMAIN_EXISTS') {
      return NextResponse.json(
        { error: 'DOMAIN_EXISTS', message: 'Ce domaine est déjà utilisé' },
        { status: 400 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'UNIQUE_CONSTRAINT_FAILED',
            message: 'Une contrainte unique a été violée',
            details: error.meta,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        error: 'CREATION_FAILED',
        message: "Une erreur est survenue lors de la création de l'école",
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}
