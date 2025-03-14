import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateSchoolDomainData } from '@/utils/validation/school-domain.validation';

import { SchoolDomainResponseDTO, UpdateSchoolDomainDTO } from '@/dto/school-domain.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/school-domains/{id}:
 *   get:
 *     tags:
 *       - School Domains
 *     summary: Récupère les détails d'un domaine d'école
 *     description: Retourne les informations d'un domaine d'école spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du domaine d'école
 *     responses:
 *       200:
 *         description: Détails du domaine récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainResponseDTO'
 *       404:
 *         description: Domaine non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolDomainResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const domain = await prisma.authorizedSchoolDomain.findUnique({
      where: {
        id: id,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domaine non trouvé' }, { status: 404 });
    }

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Erreur lors de la récupération du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du domaine' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-domains/{id}:
 *   put:
 *     tags:
 *       - School Domains
 *     summary: Met à jour un domaine d'école
 *     description: Permet de modifier le nom de domaine d'une école
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du domaine d'école à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolDomainRequest'
 *     responses:
 *       200:
 *         description: Domaine mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainResponseDTO'
 *       400:
 *         description: Données invalides ou domaine déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Domaine non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<SchoolDomainResponseDTO | { error: string; details?: Record<string, string> }>
> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateSchoolDomainDTO;

    const validationResult = await validateSchoolDomainData(body, id);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const domain = await prisma.authorizedSchoolDomain.update({
      where: {
        id: id,
      },
      data: {
        domain: body.domain,
      },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du domaine' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-domains/{id}:
 *   delete:
 *     tags:
 *       - School Domains
 *     summary: Supprime un domaine d'école
 *     description: Supprime un domaine d'école s'il n'est pas utilisé par une école
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du domaine d'école à supprimer
 *     responses:
 *       200:
 *         description: Domaine supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Domaine supprimé avec succès"
 *       400:
 *         description: Le domaine est utilisé par une école
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Domaine non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    const schoolsUsingDomain = await prisma.school.count({
      where: {
        domainId: id,
        deletedAt: null,
      },
    });

    if (schoolsUsingDomain > 0) {
      return NextResponse.json(
        {
          error: 'Ce domaine est utilisé par une ou plusieurs écoles et ne peut pas être supprimé',
        },
        { status: 400 },
      );
    }

    await prisma.authorizedSchoolDomain.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Domaine supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du domaine' },
      { status: 500 },
    );
  }
}
