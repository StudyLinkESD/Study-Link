import { FC, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type InfoItemProps = {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

const InfoItem: FC<InfoItemProps> = ({ icon: Icon, children, className = '' }) => {
  return (
    <div className={`flex items-start ${className}`}>
      <Icon className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
};

export default InfoItem;
