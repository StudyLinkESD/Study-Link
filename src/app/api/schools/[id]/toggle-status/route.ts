import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const id = (await params).id;

    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "L'école n'existe pas" }, { status: 404 });
    }

    await prisma.$executeRaw`
      UPDATE "School"
      SET "isActive" = NOT "isActive"
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du changement de statut de l'école:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de statut de l'école" },
      { status: 500 },
    );
  }
}
