import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JobTypeBadgeProps {
  type: 'Alternance' | 'Stage';
  className?: string;
}

export default function JobTypeBadge({ type, className }: JobTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn('capitalize', className)}>
      {type}
    </Badge>
  );
}
