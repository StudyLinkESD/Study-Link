import { FC, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SectionCardProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

const SectionCard: FC<SectionCardProps> = ({ title, icon: Icon, children, className = '' }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Icon className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
