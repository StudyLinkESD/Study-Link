import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CompanyResponseDTO } from '@/dto/company.dto';
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
    const body = await request.json();
    const { userId, ...companyData } = body;

    if (!userId) {
      return NextResponse.json({ error: "L'ID de l'utilisateur est requis" }, { status: 400 });
    }

    const validationResult = await validateCompanyData(companyData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "L'utilisateur n'existe pas" }, { status: 404 });
    }

    // Vérifier si l'utilisateur a déjà une entreprise
    const existingCompanyOwner = await prisma.companyOwner.findUnique({
      where: { userId },
    });

    if (existingCompanyOwner) {
      return NextResponse.json({ error: "L'utilisateur a déjà une entreprise" }, { status: 400 });
    }

    // Créer l'entreprise et le propriétaire dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: companyData,
      });

      await tx.companyOwner.create({
        data: {
          userId,
          companyId: company.id,
        },
      });

      return company;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la compagnie' },
      { status: 500 },
    );
  }
}
