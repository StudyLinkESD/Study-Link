import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  touched?: boolean;
  isValid?: boolean;
  helpText?: string;
}

export default function FormField({
  label,
  htmlFor,
  children,
  className,
  required,
  error,
  hint,
  touched,
  isValid,
  helpText,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className={cn('text-sm font-medium', error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {touched && (
          <div className="flex items-center">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : null}
          </div>
        )}
      </div>

      {children}

      {(error || hint || helpText) && (
        <div className="space-y-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
          {helpText && !error && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <HelpCircle className="w-4 h-4 mt-0.5" />
              <p>{helpText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
