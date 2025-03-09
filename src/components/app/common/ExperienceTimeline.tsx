import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building, Calendar } from 'lucide-react';

import { FC } from 'react';

import { Badge } from '@/components/ui/badge';

type SimpleExperience = {
  id: string;
  company: string;
  position: string;
  period: string;
  type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
  startDate?: Date;
  endDate?: Date;
};

type ExperienceTimelineProps = {
  experiences: SimpleExperience[];
  emptyMessage?: string;
  className?: string;
};

const ExperienceTimeline: FC<ExperienceTimelineProps> = ({
  experiences,
  emptyMessage = 'Aucune expérience professionnelle listée.',
  className = '',
}) => {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="text-muted-foreground rounded-md bg-gray-50 py-8 text-center">
        <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Stage':
        return 'bg-blue-100 text-blue-800';
      case 'Alternance':
        return 'bg-purple-100 text-purple-800';
      case 'CDI':
        return 'bg-green-100 text-green-800';
      case 'CDD':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {experiences.map((exp) => (
        <div key={exp.id} className="relative border-l-2 border-gray-200 pb-6 pl-6">
          {/* Point de repère sur la timeline */}
          <div className="bg-primary absolute -left-1.5 top-1.5 h-3 w-3 rounded-full"></div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{exp.position || 'Poste non spécifié'}</h3>
            <Badge variant="outline" className={`${getTypeBadgeColor(exp.type)} font-normal`}>
              {exp.type}
            </Badge>
          </div>

          <div className="text-muted-foreground mb-2 flex items-center text-sm">
            <Building className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="font-medium text-gray-700">
              {exp.company || 'Entreprise non spécifiée'}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="text-gray-600">
              {exp.startDate || exp.endDate ? (
                <>
                  {exp.startDate ? format(exp.startDate, 'MMMM yyyy', { locale: fr }) : ''}
                  {' - '}
                  {exp.endDate ? format(exp.endDate, 'MMMM yyyy', { locale: fr }) : 'Présent'}
                </>
              ) : (
                exp.period || 'Période non spécifiée'
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTimeline;
