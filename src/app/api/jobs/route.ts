import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateJobData } from '@/utils/validation/job.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';

import { CreateJobDTO, JobResponseDTO } from '@/dto/job.dto';
import { FilterService } from '@/services/filter.service';

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Récupère la liste des offres d'emploi
 *     description: Retourne toutes les offres d'emploi actives avec les informations de l'entreprise
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche sur le titre, la description ou le nom de l'entreprise
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filtrer par entreprise
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type de contrat
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filtrer par compétences requises
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *         description: Filtrer par disponibilité
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name]
 *           default: createdAt
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des offres d'emploi récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedJobResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<JobResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      type: searchParams.get('type') || undefined,
      skills: searchParams.getAll('skills'),
      availability: searchParams.get('availability') || undefined,
    };

    const where = FilterService.buildJobWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);

    const [jobs, total] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              logo: true,
            },
          },
        },
        ...pagination,
      }),
      prisma.job.count({ where }),
    ]);

    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      description: job.description,
      featuredImage: job.featuredImage || undefined,
      company: {
        name: job.company.name,
        logo: job.company.logo || undefined,
      },
      type: job.type,
      skills: job.skills ? job.skills.split(',').map((s) => s.trim()) : [],
      availability: job.availability || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    return NextResponse.json({
      items: formattedJobs,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des jobs' }, { status: 500 });
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
 *             $ref: '#/components/schemas/CreateJobDTO'
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
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Accès non autorisé
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
export async function POST(
  request: Request,
): Promise<NextResponse<JobResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateJobDTO;

    const validationResult = await validateJobData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: Object.entries(validationResult.errors || {}).map(([field, message]) => ({
            field,
            message,
          })),
        },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: {
        ...body,
        skills: body.skills?.join(','),
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    const formattedJob: JobResponseDTO = {
      id: job.id,
      companyId: job.companyId,
      name: job.name,
      description: job.description,
      featuredImage: job.featuredImage || undefined,
      company: {
        name: job.company.name,
        logo: job.company.logo || undefined,
      },
      type: job.type,
      skills: job.skills ? job.skills.split(',').map((s) => s.trim()) : [],
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
