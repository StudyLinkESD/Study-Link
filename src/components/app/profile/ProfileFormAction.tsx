import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ProfileFormActionsProps {
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}

export default function ProfileFormActions({
  onSubmit,
  onCancel,
  isSubmitting,
  isDirty,
}: ProfileFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
      )}
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting || !isDirty}
        className="flex items-center space-x-2"
      >
        <Save className="h-4 w-4" />
        <span>Enregistrer</span>
      </Button>
    </div>
  );
}
