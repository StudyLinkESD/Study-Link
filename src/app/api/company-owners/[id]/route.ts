import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UpdateCompanyOwnerDTO, CompanyOwnerResponseDTO } from '@/dto/company-owner.dto';
import {
  validateCompanyOwnerData,
  checkCompanyOwnerExists,
} from '@/utils/validation/company-owner.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyOwnerResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const companyOwnerCheck = await checkCompanyOwnerExists(id);

    if (!companyOwnerCheck.exists) {
      return NextResponse.json({ error: 'Propriétaire d\'entreprise non trouvé' }, { status: 404 });
    }

    const companyOwner = await prisma.companyOwner.findUnique({
      where: { id },
      include: {
        user: true,
        company: true,
      },
    });

    if (!companyOwner) {
      return NextResponse.json({ error: 'Propriétaire d\'entreprise non trouvé' }, { status: 404 });
    }

    const response: CompanyOwnerResponseDTO = {
      id: companyOwner.id,
      userId: companyOwner.userId,
      companyId: companyOwner.companyId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération du propriétaire d\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du propriétaire d\'entreprise' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyOwnerResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateCompanyOwnerDTO;

    const companyOwnerCheck = await checkCompanyOwnerExists(id);
    if (!companyOwnerCheck.exists) {
      return NextResponse.json({ error: 'Propriétaire d\'entreprise non trouvé' }, { status: 404 });
    }

    const validationResult = await validateCompanyOwnerData(body, true, id);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const companyOwner = await prisma.companyOwner.update({
      where: { id },
      data: body,
      include: {
        user: true,
        company: true,
      },
    });

    const response: CompanyOwnerResponseDTO = {
      id: companyOwner.id,
      userId: companyOwner.userId,
      companyId: companyOwner.companyId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du propriétaire d\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du propriétaire d\'entreprise' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    const companyOwnerCheck = await checkCompanyOwnerExists(id);

    if (!companyOwnerCheck.exists) {
      return NextResponse.json({ error: 'Propriétaire d\'entreprise non trouvé' }, { status: 404 });
    }

    await prisma.companyOwner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Propriétaire d\'entreprise supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du propriétaire d\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du propriétaire d\'entreprise' },
      { status: 500 },
    );
  }
}
