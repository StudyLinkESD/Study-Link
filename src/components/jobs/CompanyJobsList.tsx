'use client';

import axios from 'axios';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import FilterSelector from '@/components/app/common/FilterSelector';
import ItemGrid from '@/components/app/common/ItemGrid';
import Pagination from '@/components/app/common/Pagination';
import SearchBar from '@/components/app/common/SearchBar';
import StatusBadge from '@/components/app/common/StatusBadge';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { useCompanyId } from '@/hooks/useCompanyId';

const JOBS_PER_PAGE = 6;
const STATUS_OPTIONS = {
  ALL: 'all',
  ALTERNANT: 'Alternance',
  STAGIAIRE: 'Stage',
};

type FormattedJob = {
  id: string;
  companyId: string;
  offerTitle: string;
  companyName: string;
  description: string;
  logoUrl: string;
  status: string;
  skills: { id: string; name: string }[];
  availability?: string;
};

type FilterState = {
  statusFilter: string;
  searchTerm: string;
  selectedSkills: string[];
  currentPage: number;
};

type FilterAction =
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' };

const initialFilterState: FilterState = {
  statusFilter: STATUS_OPTIONS.ALL,
  searchTerm: '',
  selectedSkills: [],
  currentPage: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case 'ADD_SKILL':
      return {
        ...state,
        selectedSkills: [...state.selectedSkills, action.payload],
        currentPage: 1,
      };
    case 'REMOVE_SKILL':
      return {
        ...state,
        selectedSkills: state.selectedSkills.filter((skill) => skill !== action.payload),
        currentPage: 1,
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'RESET_FILTERS':
      return { ...initialFilterState, statusFilter: state.statusFilter };
    default:
      return state;
  }
}

function JobFilters({
  state,
  dispatch,
  allSkills,
  jobsCount,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  allSkills: string[];
  jobsCount: number;
}) {
  const resetFilters = () => {
    const currentStatus = state.statusFilter;
    dispatch({ type: 'RESET_FILTERS' });
    dispatch({ type: 'SET_STATUS_FILTER', payload: currentStatus });
  };

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
        <SearchBar
          onSearch={(term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term })}
          placeholder="Rechercher une offre..."
          initialValue={state.searchTerm}
          className="w-full md:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {jobsCount} offre{jobsCount !== 1 ? 's' : ''}
          </span>
          {(state.searchTerm || state.selectedSkills.length > 0) && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <TabsList className="mb-6">
        <TabsTrigger value={STATUS_OPTIONS.ALL}>Tous</TabsTrigger>
        <TabsTrigger value={STATUS_OPTIONS.ALTERNANT}>Alternance</TabsTrigger>
        <TabsTrigger value={STATUS_OPTIONS.STAGIAIRE}>Stage</TabsTrigger>
      </TabsList>

      {allSkills.length > 0 && (
        <div className="mb-6">
          <Label className="mb-2 block">Filtrer par compétences</Label>
          <div className="flex flex-wrap gap-2">
            <FilterSelector
              options={allSkills.map((skill) => ({ value: skill, label: skill }))}
              selectedValues={state.selectedSkills}
              onSelect={(skill) => dispatch({ type: 'ADD_SKILL', payload: skill })}
              onRemove={(skill) => dispatch({ type: 'REMOVE_SKILL', payload: skill })}
            />
          </div>
        </div>
      )}
    </>
  );
}

function JobCard({
  job,
  onEdit,
  onDelete,
}: {
  job: FormattedJob;
  onEdit: (job: FormattedJob) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            firstName={job.companyName}
            lastName={''}
            photoUrl={job.logoUrl}
            size="md"
            className="border-2 border-gray-200 dark:border-gray-700"
          />

          <div className="flex flex-col">
            <h3 className="text-md font-medium text-gray-500">{job.companyName}</h3>
            <h3 className="text-lg font-semibold">{job.offerTitle}</h3>

            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={job.status} />

              {job.availability && (
                <span className="text-muted-foreground text-xs">{job.availability}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="mb-2 text-sm font-medium">Compétences requises</h4>

          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 5).map((skill) => (
              <StatusBadge
                key={skill.id}
                status={skill.name}
                variant="outline"
                className="text-xs"
              />
            ))}
            {job.skills.length > 5 && (
              <StatusBadge
                status={`+${job.skills.length - 5}`}
                variant="outline"
                className="text-xs"
              />
            )}
          </div>
          <p className="mt-2 text-gray-500">◦ {job.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button variant="outline" size="sm" className="text-primary" onClick={() => onEdit(job)}>
          <Edit className="mr-1 h-4 w-4" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => onDelete(job.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CompanyJobsList() {
  const { data: session } = useSession();
  const { company, companyId, isLoading: isLoadingCompany } = useCompanyId(session);
  const [jobs, setJobs] = useState<FormattedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const { statusFilter, searchTerm, selectedSkills, currentPage } = state;
  const tabsRef = useRef<HTMLDivElement>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<FormattedJob | null>(null);
  const [jobIdToDelete, setJobIdToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  const allSkills = Array.from(
    new Set(jobs.flatMap((job) => job.skills.map((s) => s.name))),
  ).sort();

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== STATUS_OPTIONS.ALL && job.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !job.offerTitle.toLowerCase().includes(searchLower) &&
        !job.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (selectedSkills.length > 0) {
      const jobSkillNames = job.skills.map((s) => s.name.toLowerCase());
      if (
        !selectedSkills.every((skill) =>
          jobSkillNames.some((jobSkill) => jobSkill.includes(skill.toLowerCase())),
        )
      ) {
        return false;
      }
    }

    return true;
  });

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
            />

            <TabsContent value={STATUS_OPTIONS.ALL} className="mt-0">
              <ItemGrid
                items={currentJobs}
                renderItem={(job) => (
                  <JobCard job={job} onEdit={openEditDialog} onDelete={openDeleteDialog} />
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
                  <JobCard job={job} onEdit={openEditDialog} onDelete={openDeleteDialog} />
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
                  <JobCard job={job} onEdit={openEditDialog} onDelete={openDeleteDialog} />
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

      {/* Dialog de création d'offre */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle offre</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer une nouvelle offre d&apos;emploi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Titre de l&apos;offre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Développeur Full Stack"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Alternance">Alternance</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availability">Disponibilité</Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="Dès que possible, Septembre 2023, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Compétences requises</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, Node.js, TypeScript (séparés par des virgules)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du poste"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateJob} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'offre"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification d'offre */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;offre</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l&apos;offre d&apos;emploi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Titre de l&apos;offre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <select
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Alternance">Alternance</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-availability">Disponibilité</Label>
              <Input
                id="edit-availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-skills">Compétences requises</Label>
              <Input
                id="edit-skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditJob} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
