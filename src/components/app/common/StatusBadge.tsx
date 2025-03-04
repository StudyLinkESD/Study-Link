import { Badge } from '@/components/ui/badge';
import { cva, type VariantProps } from 'class-variance-authority';

const statusVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-primary',
      alternant: 'bg-blue-500 hover:bg-blue-600',
      stagiaire: 'bg-green-500 hover:bg-green-600',
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      closed: 'bg-gray-500 hover:bg-gray-600',
      active: 'bg-emerald-500 hover:bg-emerald-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  status: string;
  className?: string;
  icon?: React.ReactNode;
}

function StatusBadge({ status, variant, className, icon }: StatusBadgeProps) {
  return (
    <Badge className={statusVariants({ variant, className })}>
      {icon && <span className="mr-1">{icon}</span>}
      {status}
    </Badge>
  );
}

export default StatusBadge;
