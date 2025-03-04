// StatusBadge.tsx
// À placer dans @/components/app/common/StatusBadge.tsx

import { FC } from 'react';
import { Badge } from '@/components/ui/badge';

type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

type StatusBadgeProps = {
  status: string;
  variant?: StatusBadgeVariant;
  className?: string;
};

/**
 * Composant pour afficher un badge de statut avec des variantes différentes selon le contenu
 */
const StatusBadge: FC<StatusBadgeProps> = ({ status, variant: forcedVariant, className = '' }) => {
  // Détermine automatiquement la variante du badge en fonction du statut
  // si aucune variante n'est explicitement fournie
  let variant: StatusBadgeVariant = forcedVariant || 'default';

  if (!forcedVariant) {
    switch (status) {
      case 'Alternant':
        variant = 'default';
        break;
      case 'Stagiaire':
        variant = 'secondary';
        break;
      case 'En attente':
        variant = 'outline';
        break;
      case 'Accepté':
        variant = 'default';
        break;
      case 'Refusé':
        variant = 'destructive';
        break;
      case 'Terminé':
        variant = 'secondary';
        break;
      // Pour les badges de compétences, on utilise outline par défaut
      default:
        variant = 'outline';
    }
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
