import { Prisma } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';

import { CreateSchoolWithDomainDTO, SchoolWithDomainResponseDTO } from '@/dto/school.dto';

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
 *             $ref: '#/components/schemas/CreateSchoolWithDomainDTO'
 *     responses:
 *       200:
 *         description: École créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolWithDomainResponseDTO'
 *       400:
 *         description: Erreur de validation ou conflit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<SchoolWithDomainResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateSchoolWithDomainDTO;

    const existingUser = await prisma.user.findUnique({
      where: { email: body.owner.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [
            {
              field: 'owner.email',
              message: 'Un utilisateur avec cet email existe déjà',
            },
          ],
        },
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
        include: {
          domain: true,
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

      return {
        school,
        domain,
        owner: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur détaillée lors de la création:', error);

    if (error instanceof Error && error.message === 'DOMAIN_EXISTS') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [
            {
              field: 'domain',
              message: 'Ce domaine est déjà utilisé',
            },
          ],
        },
        { status: 400 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: [
              {
                field: (error.meta?.target as string) || 'unknown',
                message: 'Une contrainte unique a été violée',
              },
            ],
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'école" },
      { status: 500 },
    );
  }
}
