import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import SectionCard from '@/components/app/common/SectionCard';

type FormSectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

export default function FormSection({ title, icon, children, className = '' }: FormSectionProps) {
  return (
    <SectionCard title={title} icon={icon} className={className}>
      {children}
    </SectionCard>
  );
}
