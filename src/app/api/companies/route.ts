import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateCompanyDTO, CompanyResponseDTO } from '@/dto/company.dto';
import { validateCompanyData } from '@/utils/validation/company.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<CompanyResponseDTO[] | { error: string }>> {
  try {
    const companies = await prisma.company.findMany();
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Erreur lors de la récupération des compagnies:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des compagnies' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<CompanyResponseDTO | { error: string; details?: string[] }>> {
  try {
    const body = (await request.json()) as CreateCompanyDTO;

    const validationResult = await validateCompanyData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
      data: body,
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la compagnie' },
      { status: 500 },
    );
  }
}
