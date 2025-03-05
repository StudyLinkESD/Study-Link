import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateCompanyOwnerDTO, CompanyOwnerResponseDTO } from '@/dto/company-owner.dto';
import { validateCompanyOwnerData } from '@/utils/validation/company-owner.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<CompanyOwnerResponseDTO[] | { error: string }>> {
  try {
    const companyOwners = await prisma.companyOwner.findMany({
      include: {
        user: true,
        company: true,
      },
    });

    const response: CompanyOwnerResponseDTO[] = companyOwners.map((owner) => ({
      id: owner.id,
      userId: owner.userId,
      companyId: owner.companyId,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétaires d\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des propriétaires d\'entreprise' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<CompanyOwnerResponseDTO | { error: string; details?: any }>> {
  try {
    const body = (await request.json()) as CreateCompanyOwnerDTO;

    const validationResult = await validateCompanyOwnerData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const companyOwner = await prisma.companyOwner.create({
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du propriétaire d\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du propriétaire d\'entreprise' },
      { status: 500 },
    );
  }
}
