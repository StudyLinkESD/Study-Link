'use client';

import { Job } from '@prisma/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EditJobModal from './EditJobModal';
import { toast } from 'sonner';
import { jobService } from '@/services/api';

interface JobListProps {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
}

export default function JobList({ jobs, setJobs }: JobListProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleDelete = async (jobId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(jobs.filter((job) => job.id !== jobId));
        toast.success('Offre supprimée avec succès');
      } catch (error) {
        toast.error("Erreur lors de la suppression de l'offre");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du poste</TableHead>
            <TableHead>Compétences requises</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.name}</TableCell>
              <TableCell>{job.skills}</TableCell>
              <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => setEditingJob(job)}>
                  Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onJobUpdated={(updatedJob) => {
            setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
