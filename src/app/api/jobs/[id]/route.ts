import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { checkJobExists, validateJobData } from '@/utils/validation/job.validation';

import { JobResponseDTO, UpdateJobDTO } from '@/dto/job.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Récupère les détails d'une offre d'emploi
 *     description: Retourne les informations détaillées d'une offre d'emploi spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Détails de l'offre d'emploi récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponseDTO'
 *       404:
 *         description: Offre d'emploi non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       410:
 *         description: Offre d'emploi supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<JobResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const jobCheck = await checkJobExists(id);

    if (!jobCheck.exists) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    if (jobCheck.isDeleted) {
      return NextResponse.json({ error: 'Ce job a été supprimé' }, { status: 410 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    const jobResponse: JobResponseDTO = {
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      featuredImage: job.featuredImage || undefined,
      description: job.description,
      skills: job.skills || undefined,
      type: job.type,
      availability: job.availability || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };

    return NextResponse.json(jobResponse);
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du job' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     tags:
 *       - Jobs
 *     summary: Met à jour une offre d'emploi
 *     description: Permet à une entreprise de modifier les détails d'une offre d'emploi existante
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'offre d'emploi à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJobRequest'
 *     responses:
 *       200:
 *         description: Offre d'emploi mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponseDTO'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès non autorisé (utilisateur non propriétaire)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Offre d'emploi non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       410:
 *         description: Offre d'emploi supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<JobResponseDTO | { error: string; details?: Record<string, string>[] }>> {
  try {
    const id = (await params).id;
    const jobCheck = await checkJobExists(id);

    if (!jobCheck.exists) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    if (jobCheck.isDeleted) {
      return NextResponse.json({ error: 'Ce job a été supprimé' }, { status: 410 });
    }

    const body = (await request.json()) as UpdateJobDTO;

    const validationResult = await validateJobData(body, true);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: body,
      include: {
        company: true,
      },
    });

    const jobResponse: JobResponseDTO = {
      id: updatedJob.id,
      companyId: updatedJob.companyId,
      name: updatedJob.name,
      featuredImage: updatedJob.featuredImage || undefined,
      description: updatedJob.description,
      skills: updatedJob.skills || undefined,
      type: updatedJob.type,
      availability: updatedJob.availability || undefined,
      createdAt: updatedJob.createdAt,
      updatedAt: updatedJob.updatedAt,
    };

    return NextResponse.json(jobResponse);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du job' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     tags:
 *       - Jobs
 *     summary: Supprime une offre d'emploi
 *     description: Marque une offre d'emploi comme supprimée (soft delete)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'offre d'emploi à supprimer
 *     responses:
 *       200:
 *         description: Offre d'emploi supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Job supprimé avec succès"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès non autorisé (utilisateur non propriétaire)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Offre d'emploi non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       410:
 *         description: Offre d'emploi déjà supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    const jobCheck = await checkJobExists(id);

    if (!jobCheck.exists) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }

    if (jobCheck.isDeleted) {
      return NextResponse.json({ error: 'Ce job a déjà été supprimé' }, { status: 410 });
    }

    await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Job supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du job' }, { status: 500 });
  }
}
