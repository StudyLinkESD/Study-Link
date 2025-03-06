import React from 'react';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

// Créer un type pour les props du Badge basé sur les variantes disponibles
type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  className?: string;
}

// Définition des variantes personnalisées en dehors du composant pour éviter la recréation à chaque rendu
const variantClasses = {
  success:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100/80 dark:hover:bg-green-900/80',
};

function StatusBadgeComponent({
  status,
  variant = 'default',
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      variant={variant === 'success' ? 'secondary' : variant} // Fallback to standard variants
      className={cn(variant === 'success' ? variantClasses.success : '', className)}
      {...props}
    >
      {status}
    </Badge>
  );
}

// Mémorisation du composant pour éviter les rendus inutiles
const StatusBadge = React.memo(StatusBadgeComponent);

export default StatusBadge;
