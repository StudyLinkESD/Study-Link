import { Job, PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateJobData } from '@/utils/validation/job.validation';

import { CreateJobDTO, JobResponseDTO } from '@/dto/job.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Récupère la liste des offres d'emploi
 *     description: Retourne toutes les offres d'emploi actives avec les informations de l'entreprise
 *     responses:
 *       200:
 *         description: Liste des offres d'emploi récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   offerTitle:
 *                     type: string
 *                   companyName:
 *                     type: string
 *                   description:
 *                     type: string
 *                   logoUrl:
 *                     type: string
 *                   status:
 *                     type: string
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                   availability:
 *                     type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(): Promise<
  NextResponse<
    | {
        id: string;
        offerTitle: string;
        companyName: string;
        description: string;
        logoUrl: string;
        status: string;
        skills: { id: string; name: string }[];
        availability?: string;
      }[]
    | { error: string }
  >
> {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      offerTitle: job.name,
      companyName: job.company.name,
      description: job.description,
      logoUrl: job.company.logo || '',
      status: job.type,
      skills: job.skills
        ? job.skills.split(',').map((skill) => ({
            id: skill.trim().toLowerCase(),
            name: skill.trim(),
          }))
        : [],
      availability: job.availability || undefined,
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'An error occurred while fetching jobs' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     tags:
 *       - Jobs
 *     summary: Crée une nouvelle offre d'emploi
 *     description: Permet à une entreprise de créer une nouvelle offre d'emploi
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobRequest'
 *     responses:
 *       201:
 *         description: Offre d'emploi créée avec succès
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
 *         description: Accès non autorisé (utilisateur non entreprise)
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
export async function POST(
  request: Request,
): Promise<NextResponse<JobResponseDTO | { error: string; details?: Record<string, string>[] }>> {
  try {
    const body = (await request.json()) as CreateJobDTO;

    const validationResult = await validateJobData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: body,
      include: {
        company: true,
      },
    });

    const formattedJob: JobResponseDTO = {
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      featuredImage: job.featuredImage || undefined,
      description: job.description,
      skills: (job as Job).skills || undefined,
      type: job.type,
      availability: job.availability || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };

    return NextResponse.json(formattedJob, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du job:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du job' }, { status: 500 });
  }
}
