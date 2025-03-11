/**
 * @swagger
 * /api/school-domains/validate-school-email:
 *   post:
 *     tags:
 *       - School Domains
 *     summary: Valider un email scolaire
 *     description: Vérifie si l'email fourni correspond à une école enregistrée dans le système
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateSchoolEmailDTO'
 *     responses:
 *       200:
 *         description: Email validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   description: Indique si l'email est valide
 *                 schoolId:
 *                   type: string
 *                   format: uuid
 *                   description: ID de l'école correspondante
 *                 schoolName:
 *                   type: string
 *                   description: Nom de l'école correspondante
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { ApiError } from '@/types/error.type';

import { ValidateSchoolEmailDTO } from '@/dto/school-domain.dto';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ isValid: boolean; schoolId?: string; schoolName?: string } | ApiError>> {
  try {
    const body = (await request.json()) as ValidateSchoolEmailDTO;

    if (!body.email) {
      return NextResponse.json({ error: "L'email est requis" }, { status: 400 });
    }

    const [, domain] = body.email.split('@');

    if (!domain) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 });
    }

    const school = await prisma.school.findFirst({
      where: {
        domain: {
          domain: domain,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        { error: "L'email scolaire doit correspondre à une école enregistrée" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      isValid: true,
      schoolId: school.id,
      schoolName: school.name,
    });
  } catch (error) {
    console.error("Erreur lors de la validation de l'email:", error);
    return NextResponse.json({ error: "Erreur lors de la validation de l'email" }, { status: 500 });
  }
}
