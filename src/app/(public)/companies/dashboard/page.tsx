'use client';

import { useSession } from 'next-auth/react';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

import CompanyJobsList from '@/components/jobs/CompanyJobsList';
import StudentsJobsRequestsList from '@/components/jobs/StudentsJobsRequestsList';

import { useCompanyId } from '@/hooks/useCompanyId';

const CompanyDashboardPage = () => {
  const { data: session, status } = useSession();
  const { isLoading: isLoadingCompany } = useCompanyId(session);

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }

    // Vérifier si l'utilisateur est une entreprise (à adapter selon votre logique d'authentification)
    // if (session?.user?.role !== 'company') {
    //   redirect('/');
    // }
  }, [session, status]);

  if (status === 'loading' || isLoadingCompany) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Tableau de bord Entreprise</h1>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <CompanyJobsList />
        <StudentsJobsRequestsList />
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
