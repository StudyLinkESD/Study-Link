import { LucideIcon } from 'lucide-react';

import { FC, isValidElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type InfoItemProps = {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  iconColor?: 'primary' | 'secondary' | 'muted' | 'accent' | 'custom';
  label?: string;
};

const InfoItem: FC<InfoItemProps> = ({
  icon: Icon,
  children,
  className = '',
  iconClassName = '',
  contentClassName = '',
  iconSize = 'md',
  iconColor = 'muted',
  label,
}) => {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
    accent: 'text-accent',
    custom: '',
  };

  const iconClasses = cn(
    iconSizes[iconSize],
    iconColors[iconColor],
    'mr-2 shrink-0 mt-0.5',
    iconClassName,
  );

  const isComplexChildren = isValidElement(children);

  return (
    <div className={cn('flex items-start', className)}>
      <Icon className={iconClasses} />

      <div className={cn('flex flex-col', contentClassName)}>
        {label && <span className="text-muted-foreground mb-0.5 text-xs font-medium">{label}</span>}

        {isComplexChildren ? children : <span>{children}</span>}
      </div>
    </div>
  );
};

export default InfoItem;
