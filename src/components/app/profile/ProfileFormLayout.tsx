import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionCard from '@/components/app/common/SectionCard';
import ProfileCompletion from '@/components/app/profileForm/ProfileCompletion';
import { BarChart2 } from 'lucide-react';

interface ProfileFormLayoutProps {
  children: ReactNode;
  tabs: {
    id: string;
    label: string;
    content: ReactNode;
  }[];
  completionFields: {
    label: string;
    completed: boolean;
    required?: boolean;
  }[];
}

export default function ProfileFormLayout({
  children,
  tabs,
  completionFields,
}: ProfileFormLayoutProps) {
  const adaptedFields = completionFields.map((field) => ({
    name: field.label,
    completed: field.completed,
    required: field.required ?? true,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue={tabs[0].id} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <SectionCard title="Progression du profil" icon={BarChart2}>
            <ProfileCompletion fields={adaptedFields} />
          </SectionCard>
          {children}
        </div>
      </div>
    </div>
  );
}
