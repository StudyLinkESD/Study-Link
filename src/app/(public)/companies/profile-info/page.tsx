import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

import { CompanyProfileForm } from './components/company-profile-form';

export default async function CompanyProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      companyOwner: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/');
  }

  let company;
  if (!user.companyOwner) {
    const newCompany = await prisma.company.create({
      data: {
        name: 'Nouvelle Entreprise',
      },
    });

    await prisma.companyOwner.create({
      data: {
        userId: user.id,
        companyId: newCompany.id,
      },
    });

    company = newCompany;
  } else {
    company = user.companyOwner.company;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profil de l&apos;entreprise</h1>
        <p className="text-muted-foreground mt-2">
          {!user.companyOwner
            ? 'Complétez les informations de votre entreprise'
            : 'Mettez à jour les informations de votre entreprise'}
        </p>
      </div>
      <CompanyProfileForm company={company} />
    </div>
  );
}
