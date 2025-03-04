import { FC } from 'react';

type Experience = {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

type ExperienceTimelineProps = {
  experiences: Experience[];
  emptyMessage?: string;
  className?: string;
};

const ExperienceTimeline: FC<ExperienceTimelineProps> = ({
  experiences,
  emptyMessage = 'Aucune expérience professionnelle listée.',
  className = '',
}) => {
  if (!experiences || experiences.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {experiences.map((exp) => (
        <div key={exp.id} className="border-l-2 border-primary pl-4 pb-1">
          <h3 className="font-semibold">{exp.position}</h3>
          <div className="text-sm text-muted-foreground mb-2">
            {exp.company} | {exp.startDate} - {exp.endDate || 'Présent'}
          </div>
          {exp.description && <p className="text-sm">{exp.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default ExperienceTimeline;
