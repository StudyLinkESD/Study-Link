'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';

interface JobApplicationModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JobApplicationModal({
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
  onSuccess,
}: JobApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState(`Candidature pour le poste: ${jobTitle}`);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('Champs requis', {
        description: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/student/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          status: 'PENDING',
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to apply');
      }

      toast.success('Candidature envoyée', {
        description: 'Votre candidature a été envoyée avec succès.',
      });

      onSuccess();
      onClose();
      router.refresh();
    } catch (error) {
      toast.error('Erreur', {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'envoi de votre candidature.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Postuler chez {companyName}</DialogTitle>
            <DialogDescription>
              Envoyez votre candidature pour le poste de {jobTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de votre candidature"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                className="min-h-[150px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
