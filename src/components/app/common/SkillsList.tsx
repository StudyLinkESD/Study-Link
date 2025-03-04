import { FC } from 'react';
import { Badge } from '@/components/ui/badge';

type Skill = {
  id: string;
  name: string;
};

type SkillsListProps = {
  skills: Skill[];
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
};

const SkillsList: FC<SkillsListProps> = ({ skills, variant = 'secondary', className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {skills.map((skill) => (
        <Badge key={skill.id} variant={variant}>
          {skill.name}
        </Badge>
      ))}
    </div>
  );
};

export default SkillsList;
