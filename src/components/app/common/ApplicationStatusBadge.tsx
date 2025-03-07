import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ApplicationStatus, getStatusLabel } from '@/utils/students/dashboard/status-mapping.utils';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export default function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const getVariantClass = (status: ApplicationStatus | string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Badge variant="secondary" className={cn(getVariantClass(status), 'border-0', className)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
