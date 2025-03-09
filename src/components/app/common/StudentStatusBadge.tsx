import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

interface StudentStatusBadgeProps {
  status: string;
  className?: string;
}

export default function StudentStatusBadge({ status, className }: StudentStatusBadgeProps) {
  const getVariantClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ALTERNANT':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'STAGIAIRE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ALTERNANT':
        return 'Alternant';
      case 'STAGIAIRE':
        return 'Stagiaire';
      default:
        return status;
    }
  };

  return (
    <Badge variant="secondary" className={cn(getVariantClass(status), 'border-0', className)}>
      {getLabel(status)}
    </Badge>
  );
}
