import { Button } from '@/components/ui/button';

type NavigationButtonsProps = {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: boolean;
  isSubmitting?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showSubmitButton?: boolean;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
};

export default function NavigationButtons({
  onBack,
  onNext,
  isSubmitting = false,
  showBackButton = false,
  showNextButton = false,
  showSubmitButton = false,
  nextLabel = 'Continuer',
  backLabel = 'Retour',
  submitLabel = 'Enregistrer',
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between">
      {showBackButton && (
        <Button type="button" variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
      )}

      <div className={showBackButton ? '' : 'ml-auto'}>
        {showNextButton && (
          <Button type="button" onClick={onNext}>
            {nextLabel}
          </Button>
        )}

        {showSubmitButton && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
