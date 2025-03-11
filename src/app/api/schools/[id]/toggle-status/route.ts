import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { ApiError } from '@/types/error.type';

import { SchoolResponseDTO } from '@/dto/school.dto';

/**
 * @swagger
 * /api/schools/{id}/toggle-status:
 *   patch:
 *     tags:
 *       - Schools
 *     summary: Active ou désactive une école
 *     description: Inverse le statut d'activation d'une école
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'école
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponseDTO'
 *       404:
 *         description: École non trouvée
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
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolResponseDTO | ApiError>> {
  try {
    const id = (await params).id;

    const existingSchool = await prisma.school.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "L'école n'existe pas" }, { status: 404 });
    }

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { isActive: !existingSchool.isActive },
      include: { domain: true },
    });

    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error("Erreur lors du changement de statut de l'école:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de statut de l'école" },
      { status: 500 },
    );
  }
}
