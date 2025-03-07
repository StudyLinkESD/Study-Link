'use client';

import { useState, useEffect } from 'react';
import { Job } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { jobService } from '@/services/api';

interface EditJobModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (job: Job) => void;
}

export default function EditJobModal({ job, isOpen, onClose, onJobUpdated }: EditJobModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    skills: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: job.name,
      description: job.description,
      skills: job.skills || '',
    });
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedJob = await jobService.updateJob(job.id, formData);
      onJobUpdated(updatedJob);
      toast.success('Offre mise à jour avec succès');
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'offre");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;offre d&apos;emploi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom du poste
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium mb-1">
              Compétences requises
            </label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
