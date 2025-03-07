import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';

import { cn } from '@/lib/utils';

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
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : error ? (
              <AlertCircle className="text-destructive h-4 w-4" />
            ) : null}
          </div>
        )}
      </div>

      {children}

      {(error || hint || helpText) && (
        <div className="space-y-2">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {hint && !error && <p className="text-muted-foreground text-sm">{hint}</p>}
          {helpText && !error && (
            <div className="text-muted-foreground flex items-start gap-2 text-sm">
              <HelpCircle className="mt-0.5 h-4 w-4" />
              <p>{helpText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
