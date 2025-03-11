'use client';

import axios from 'axios';
import { Loader2, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { useCompanyId } from '@/hooks/useCompanyId';

import { filterJobs, filterReducer, initialFilterState } from '@/utils/jobFilters';

import { FormattedJob } from '@/types/jobs';

import { JOBS_PER_PAGE, STATUS_OPTIONS } from '@/constants/jobs';

import { JobCard } from './JobCard';
import { CreateJobDialog, DeleteJobDialog, EditJobDialog, JobFormData } from './JobDialogs';
import { JobFilters } from './JobFilters';

export default function CompanyJobsList() {
  const { data: session } = useSession();
  const { company, companyId, isLoading: isLoadingCompany } = useCompanyId(session);
  const [jobs, setJobs] = useState<FormattedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<FormattedJob | null>(null);
  const [jobIdToDelete, setJobIdToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobFormData>({
    name: '',
    description: '',
    skills: '',
    type: 'Alternance',
    availability: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompanyJobs = useCallback(async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      const response = await axios.get('/api/jobs');

      const companyJobs = response.data.filter((job: FormattedJob) => job.companyId === companyId);
      setJobs(companyJobs);
    } catch {
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyJobs();
    }
  }, [companyId, fetchCompanyJobs]);

  useEffect(() => {
    const handleResetSelectedJob = () => {
      setSelectedJobId(null);
    };

    window.addEventListener('reset-selected-job', handleResetSelectedJob);

    return () => {
      window.removeEventListener('reset-selected-job', handleResetSelectedJob);
    };
  }, []);

  const allSkills = Array.from(
    new Set(jobs.flatMap((job) => job.skills.map((s) => s.name))),
  ).sort();

  const filteredJobs = filterJobs(jobs, state);
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE,
  );

  const handleCreateJob = async () => {
    if (!companyId) return;

    setIsSubmitting(true);
    try {
      await axios.post('/api/jobs', {
        companyId: companyId,
        name: formData.name,
        description: formData.description,
        skills: formData.skills,
        type: formData.type,
        availability: formData.availability,
      });

      toast.success('Offre créée avec succès');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCompanyJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Erreur lors de la création de l&apos;offre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = async () => {
    if (!currentJob) return;

    setIsSubmitting(true);
    try {
      await axios.put(`/api/jobs/${currentJob.id}`, {
        name: formData.name,
        description: formData.description,
        skills: formData.skills,
        type: formData.type,
        availability: formData.availability,
      });

      toast.success('Offre mise à jour avec succès');
      setIsEditDialogOpen(false);
      resetForm();
      fetchCompanyJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Erreur lors de la mise à jour de l&apos;offre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobIdToDelete) return;

    try {
      await axios.delete(`/api/jobs/${jobIdToDelete}`);
      toast.success('Offre supprimée avec succès');
      setJobs(jobs.filter((job) => job.id !== jobIdToDelete));
      setIsDeleteDialogOpen(false);
      setJobIdToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error("Erreur lors de la suppression de l'offre");
    }
  };

  const openEditDialog = (job: FormattedJob) => {
    setCurrentJob(job);
    setFormData({
      name: job.offerTitle,
      description: job.description,
      skills: job.skills.map((s) => s.name).join(', '),
      type: job.status,
      availability: job.availability || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setJobIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleJobClick = (job: FormattedJob) => {
    setSelectedJobId(job.id);

    const jobSelectedEvent = new CustomEvent('job-selected', {
      detail: {
        jobId: job.id,
        jobTitle: job.offerTitle,
      },
    });
    window.dispatchEvent(jobSelectedEvent);

    const requestsSection = document.getElementById('students-jobs-requests');
    if (requestsSection) {
      requestsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      skills: '',
      type: 'Alternance',
      availability: '',
    });
    setCurrentJob(null);
  };

  if (isLoadingCompany || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
          <p>Chargement des offres...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-lg font-medium">Vous n&apos;êtes pas associé à une entreprise</p>
          <p className="text-muted-foreground">
            Veuillez contacter un administrateur pour associer votre compte à une entreprise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/3 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes offres d&apos;emploi</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer une offre
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs
            ref={tabsRef}
            defaultValue={STATUS_OPTIONS.ALL}
            value={statusFilter}
            className="w-full"
            onValueChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', payload: value })}
          >
            <JobFilters
              state={state}
              dispatch={dispatch}
              allSkills={allSkills}
              jobsCount={filteredJobs.length}
              statusOptions={STATUS_OPTIONS}
            />

            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => (
                  <JobCard
                    job={job}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    onClick={handleJobClick}
                    isSelected={selectedJobId === job.id}
                  />
                )}
                keyExtractor={(job) => job.id}
                emptyState={{
                  title: 'Aucune offre trouvée',
                  description: 'Aucune offre ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.ALTERNANT} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => (
                  <JobCard
                    job={job}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    onClick={handleJobClick}
                    isSelected={selectedJobId === job.id}
                  />
                )}
                keyExtractor={(job) => job.id}
                emptyState={{
                  title: "Aucune offre d'alternance trouvée",
                  description:
                    "Aucune offre d'alternance ne correspond à vos critères de recherche.",
                }}
              />
            </TabsContent>
            <TabsContent value={STATUS_OPTIONS.STAGIAIRE} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => (
                  <JobCard
                    job={job}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    onClick={handleJobClick}
                    isSelected={selectedJobId === job.id}
                  />
                )}
                keyExtractor={(job) => job.id}
                emptyState={{
                  title: 'Aucune offre de stage trouvée',
                  description: 'Aucune offre de stage ne correspond à vos critères de recherche.',
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => dispatch({ type: 'SET_PAGE', payload: page })}
        />
      )}

      <CreateJobDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateJob}
        isSubmitting={isSubmitting}
      />

      <EditJobDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditJob}
        isSubmitting={isSubmitting}
      />

      <DeleteJobDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
