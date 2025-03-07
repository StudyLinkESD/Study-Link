// SkillsSelector.tsx
import { useId } from 'react';
import { Label } from '@/components/ui/label';
import SkillBadge from '@/components/app/common/SkillBadge';

type Skill = {
  id: string;
  name: string;
};

type SkillsSelectorProps = {
  availableSkills: Skill[];
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
};

export default function SkillsSelector({
  availableSkills,
  selectedSkills,
  onChange,
  error,
}: SkillsSelectorProps) {
  const groupId = useId();

  const handleSkillToggle = (skillName: string, isChecked: boolean) => {
    if (isChecked) {
      onChange([...selectedSkills, skillName]);
    } else {
      onChange(selectedSkills.filter((skill) => skill !== skillName));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {availableSkills.map((skill) => (
          <div key={skill.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${groupId}-skill-${skill.id}`}
              value={skill.name}
              checked={selectedSkills.includes(skill.name)}
              onChange={(e) => handleSkillToggle(skill.name, e.target.checked)}
              className="rounded text-primary"
            />
            <Label htmlFor={`${groupId}-skill-${skill.id}`} className="cursor-pointer">
              {skill.name}
            </Label>
          </div>
        ))}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="pt-4">
        <Label>Compétences sélectionnées</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedSkills.length > 0 ? (
            selectedSkills.map((skill, index) => <SkillBadge key={index} skill={skill} />)
          ) : (
            <p className="text-muted-foreground text-sm italic">Aucune compétence sélectionnée</p>
          )}
        </div>
      </div>
    </div>
  );
}
