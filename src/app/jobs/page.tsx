'use client';

import axios from 'axios';
import { Loader2 } from 'lucide-react';

import { useEffect, useState } from 'react';

import { JobCardProps } from '@/components/app/jobs/JobCard';
import JobsList from '@/components/app/jobs/JobsList';
import JobView from '@/components/app/jobs/JobView';

import { JobProvider } from '@/context/job.context';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Une erreur est survenue lors du chargement des offres');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
          <p>Chargement des offres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <JobProvider>
      <main className="flex w-full flex-1 flex-row items-start justify-start px-20">
        <JobsList jobs={jobs} title="Découvrez nos offres" />
        <JobView />
      </main>
    </JobProvider>
  );
}
