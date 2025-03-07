'use client';

import { useEffect, useState } from 'react';
import { Job } from '@prisma/client';
import JobList from '@/components/company/JobList';
import CreateJobModal from '@/components/company/CreateJobModal';
import { Button } from '@/components/ui/button';
import { jobService } from '@/services/api';

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getAllJobs();
        setJobs(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord Entreprise</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Créer une nouvelle offre</Button>
      </div>

      <JobList jobs={jobs} setJobs={setJobs} />

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onJobCreated={(newJob) => setJobs([...jobs, newJob])}
      />
    </div>
  );
}
