import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/students/job-requests:
 *   get:
 *     tags:
 *       - Students
 *     summary: Récupère les demandes d'emploi des étudiants
 *     description: Retourne la liste des demandes d'emploi avec pagination
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
 *     responses:
 *       200:
 *         description: Liste des demandes d'emploi récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentJobRequestResponseDTO'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Only students can view job requests' }, { status: 403 });
    }

    const jobRequests = await prisma.jobRequest.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(jobRequests);
  } catch (error) {
    console.error('Error fetching job requests:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/job-requests:
 *   post:
 *     tags:
 *       - Students
 *     summary: Crée une nouvelle demande d'emploi
 *     description: Permet à un étudiant de postuler à une offre d'emploi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentJobRequestDTO'
 *     responses:
 *       201:
 *         description: Demande d'emploi créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentJobRequestResponseDTO'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentJobRequestError'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Offre d'emploi non trouvée
 *       409:
 *         description: L'étudiant a déjà postulé à cette offre
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Only students can apply for jobs' }, { status: 403 });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existingRequest = await prisma.jobRequest.findFirst({
      where: {
        studentId: student.id,
        jobId,
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
    }

    const jobRequest = await prisma.jobRequest.create({
      data: {
        studentId: student.id,
        jobId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(jobRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating job request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}
