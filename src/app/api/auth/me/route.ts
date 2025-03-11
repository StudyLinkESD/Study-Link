import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { EnrichedUserResponseDTO } from '@/types/user.dto';

import { auth } from '@/auth';
import { FilterService } from '@/services/filter.service';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     description: Retrieves detailed information about the currently authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrichedUserResponseDTO'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: FilterService.getDefaultUserInclude(),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response: EnrichedUserResponseDTO = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString() || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
