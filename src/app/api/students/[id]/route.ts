import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateStudentData } from '@/utils/validation/student.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';

import { StudentResponseDTO, UpdateStudentDTO } from '@/dto/student.dto';
import { FilterService } from '@/services/filter.service';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     tags:
 *       - Students
 *     summary: Récupère un étudiant par son ID
 *     description: Retourne les informations détaillées d'un étudiant spécifique
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
 *         description: Étudiant récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponseDTO'
 *       404:
 *         description: Étudiant non trouvé
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
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<StudentResponseDTO | ApiError>> {
  try {
    const id = (await params).id;
    const student = await prisma.student.findUnique({
      where: { id },
      include: FilterService.getDefaultStudentInclude(),
    });

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    return NextResponse.json(student as unknown as StudentResponseDTO);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'étudiant" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     tags:
 *       - Students
 *     summary: Met à jour un étudiant
 *     description: Met à jour les informations d'un étudiant existant
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
 *             $ref: '#/components/schemas/UpdateStudentDTO'
 *     responses:
 *       200:
 *         description: Étudiant mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponseDTO'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Étudiant non trouvé
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
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<StudentResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const id = (await params).id;
    const data = (await request.json()) as UpdateStudentDTO;

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const validationResult = await validateStudentData({
      ...existingStudent,
      ...data,
      status: data.status as 'Alternant' | 'Stagiaire',
    });
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        status: data.status,
        skills: data.skills,
        apprenticeshipRhythm: data.apprenticeshipRhythm,
        description: data.description,
        curriculumVitae: data.curriculumVitae,
        previousCompanies: data.previousCompanies,
        availability: data.availability,
      },
      include: FilterService.getDefaultStudentInclude(),
    });

    return NextResponse.json(updatedStudent as unknown as StudentResponseDTO);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'étudiant" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     tags:
 *       - Students
 *     summary: Supprime un étudiant
 *     description: Supprime un étudiant existant
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
 *         description: Étudiant supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Étudiant non trouvé
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
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | ApiError>> {
  try {
    const id = (await params).id;

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'étudiant" },
      { status: 500 },
    );
  }
}
