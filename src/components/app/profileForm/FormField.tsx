// FormField.tsx
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

export default function FormField({
  label,
  htmlFor,
  children,
  error,
  required = false,
  hint,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
