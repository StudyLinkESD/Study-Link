import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateJobRequestUpdateData } from '@/utils/validation/job-request.validation';

import { auth } from '@/auth';
import { JobRequestResponseDTO, UpdateJobRequestDTO } from '@/dto/job-request.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/job-requests/{id}:
 *   get:
 *     tags:
 *       - Job Requests
 *     summary: Récupère les détails d'une demande d'emploi
 *     description: Retourne les informations détaillées d'une demande d'emploi spécifique
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la demande d'emploi
 *     responses:
 *       200:
 *         description: Détails de la demande d'emploi récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRequestResponseDTO'
 *       404:
 *         description: Demande d'emploi non trouvée
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
): Promise<NextResponse<JobRequestResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const jobRequest = await prisma.jobRequest.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        student: true,
        job: true,
      },
    });

    if (!jobRequest) {
      return NextResponse.json({ error: 'Job request non trouvée' }, { status: 404 });
    }

    const formattedJobRequest: JobRequestResponseDTO = {
      id: jobRequest.id,
      studentId: jobRequest.studentId,
      jobId: jobRequest.jobId,
      status: jobRequest.status,
      createdAt: jobRequest.createdAt,
      updatedAt: jobRequest.updatedAt,
    };

    return NextResponse.json(formattedJobRequest);
  } catch (error) {
    console.error('Erreur lors de la récupération de la job request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la job request' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/job-requests/{id}:
 *   put:
 *     tags:
 *       - Job Requests
 *     summary: Met à jour une demande d'emploi
 *     description: Met à jour le statut et/ou le message d'une demande d'emploi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la demande d'emploi à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJobRequestRequest'
 *     responses:
 *       200:
 *         description: Demande d'emploi mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRequestResponseDTO'
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
 *       404:
 *         description: Demande d'emploi non trouvée
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
): Promise<
  NextResponse<JobRequestResponseDTO | { error: string; details?: Record<string, string>[] }>
> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateJobRequestDTO;

    const validationResult = await validateJobRequestUpdateData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const jobRequest = await prisma.jobRequest.update({
      where: {
        id: id,
      },
      data: body,
      include: {
        student: true,
        job: true,
      },
    });

    const formattedJobRequest: JobRequestResponseDTO = {
      id: jobRequest.id,
      studentId: jobRequest.studentId,
      jobId: jobRequest.jobId,
      status: jobRequest.status,
      createdAt: jobRequest.createdAt,
      updatedAt: jobRequest.updatedAt,
    };

    return NextResponse.json(formattedJobRequest);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la job request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la job request' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Job request ID is required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Only students can delete job requests' }, { status: 403 });
    }

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id },
      select: { studentId: true },
    });

    if (!jobRequest) {
      return NextResponse.json({ error: 'Job request not found' }, { status: 404 });
    }

    if (jobRequest.studentId !== student.id) {
      return NextResponse.json(
        { error: 'You can only delete your own job requests' },
        { status: 403 },
      );
    }

    await prisma.jobRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}
