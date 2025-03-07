import { LucideIcon } from 'lucide-react';

import { FC, ReactNode } from 'react';

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
          <Icon className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
