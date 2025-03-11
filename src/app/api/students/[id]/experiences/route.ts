import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';
import { ExperienceType } from '@/types/student.type';

import { ExperienceDTO } from '@/dto/student.dto';
import { FilterService } from '@/services/filter.service';

function isValidExperienceType(type: string): type is ExperienceType {
  return ['Stage', 'Alternance', 'CDI', 'CDD', 'Autre'].includes(type);
}

function formatExperience(experience: {
  id: string;
  position: string;
  company: string;
  startDate: Date | null;
  endDate: Date | null;
  type: string;
  studentId: string;
}): ExperienceDTO {
  if (!isValidExperienceType(experience.type)) {
    throw new Error(`Type d'expérience invalide: ${experience.type}`);
  }

  return {
    id: experience.id,
    position: experience.position,
    company: experience.company,
    startDate: experience.startDate?.toISOString() || '',
    endDate: experience.endDate?.toISOString(),
    type: experience.type,
  };
}

/**
 * @swagger
 * /api/students/{id}/experiences:
 *   get:
 *     tags:
 *       - Students
 *     summary: Récupère les expériences d'un étudiant
 *     description: Retourne la liste des expériences professionnelles d'un étudiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Liste des expériences récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExperienceDTO'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<PaginatedResponse<ExperienceDTO> | ApiError>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      orderBy: searchParams.get('orderBy') || 'startDate',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as ExperienceType | undefined,
      company: searchParams.get('company') || undefined,
      startDateAfter: searchParams.get('startDateAfter')
        ? new Date(searchParams.get('startDateAfter')!)
        : undefined,
      startDateBefore: searchParams.get('startDateBefore')
        ? new Date(searchParams.get('startDateBefore')!)
        : undefined,
    };

    const where = {
      ...FilterService.buildExperienceWhereClause(filters),
      studentId: id,
    };

    const pagination = FilterService.buildPaginationOptions(filters);

    const [experiences, total] = await prisma.$transaction([
      prisma.experience.findMany({
        where,
        ...pagination,
      }),
      prisma.experience.count({ where }),
    ]);

    return NextResponse.json({
      items: experiences.map(formatExperience),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des expériences' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/{id}/experiences:
 *   post:
 *     tags:
 *       - Students
 *     summary: Ajoute une expérience à un étudiant
 *     description: Crée une nouvelle expérience professionnelle pour un étudiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'étudiant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienceDTO'
 *     responses:
 *       200:
 *         description: Expérience créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExperienceDTO'
 *       400:
 *         description: Données invalides
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
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExperienceDTO | ValidationErrorResponse | ApiError>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const data = await request.json();

  if (!isValidExperienceType(data.type)) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: [{ field: 'type', message: `Type d'expérience invalide: ${data.type}` }],
      },
      { status: 400 },
    );
  }

  try {
    const experience = await prisma.experience.create({
      data: {
        ...data,
        studentId: id,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(formatExperience(experience));
  } catch (error) {
    console.error("Erreur lors de la création de l'expérience:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'expérience" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/{id}/experiences:
 *   put:
 *     tags:
 *       - Students
 *     summary: Met à jour une expérience
 *     description: Met à jour une expérience professionnelle existante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'étudiant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienceDTO'
 *     responses:
 *       200:
 *         description: Expérience mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExperienceDTO'
 *       400:
 *         description: Données invalides
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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExperienceDTO | ValidationErrorResponse | ApiError>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const data = await request.json();

  if (!isValidExperienceType(data.type)) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: [{ field: 'type', message: `Type d'expérience invalide: ${data.type}` }],
      },
      { status: 400 },
    );
  }

  try {
    const experience = await prisma.experience.update({
      where: {
        id: data.id,
        studentId: id,
      },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(formatExperience(experience));
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'expérience:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'expérience" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/{id}/experiences:
 *   delete:
 *     tags:
 *       - Students
 *     summary: Supprime une expérience
 *     description: Supprime une expérience professionnelle existante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'étudiant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'expérience à supprimer
 *     responses:
 *       200:
 *         description: Expérience supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExperienceDTO'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | ApiError>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const data = await request.json();

  try {
    await prisma.experience.delete({
      where: {
        id: data.id,
        studentId: id,
      },
    });

    return NextResponse.json({ message: 'Expérience supprimée avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'expérience:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'expérience" },
      { status: 500 },
    );
  }
}
