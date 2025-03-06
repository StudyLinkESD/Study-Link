import { ReactNode } from 'react';
import SectionCard from '@/components/app/common/SectionCard';

interface ProfileFormSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export default function ProfileFormSection({ title, icon, children }: ProfileFormSectionProps) {
  return (
    <SectionCard title={title} icon={icon}>
      <div className="space-y-6">{children}</div>
    </SectionCard>
  );
}
