import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill?: string;
  label?: string;
  className?: string;
}

export default function SkillBadge({ skill, label, className }: SkillBadgeProps) {
  const text = skill || label;

  if (!text) {
    throw new Error('Either skill or label prop must be provided to SkillBadge');
  }

  return (
    <Badge
      variant="secondary"
      className={cn('bg-primary/10 text-primary hover:bg-primary/20', className)}
    >
      {text}
    </Badge>
  );
}
